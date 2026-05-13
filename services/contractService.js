const db = require('../database');

async function getProjectById(projectId) {
  const result = await db.query('SELECT id, client_id, status FROM projects WHERE id = $1', [projectId]);
  return result.rows[0] || null;
}

async function getBidById(bidId) {
  const result = await db.query('SELECT id, freelancer_id, project_id, bid_amount FROM bids WHERE id = $1', [bidId]);
  return result.rows[0] || null;
}

async function getContractById(contractId) {
  const result = await db.query('SELECT * FROM contracts WHERE id = $1', [contractId]);
  return result.rows[0] || null;
}

async function getContractByIdAndClientId(contractId, clientId) {
  const result = await db.query('SELECT * FROM contracts WHERE id = $1 AND client_id = $2', [contractId, clientId]);
  return result.rows[0] || null;
}

async function createContractForClient(clientId, payload) {
  const { bid_id, started_at = null, ended_at = null } = payload;

  if (!bid_id) {
    const error = new Error('bid_id is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const bid = await getBidById(bid_id);
  if (!bid) {
    const error = new Error('Bid not found');
    error.code = 'BID_NOT_FOUND';
    throw error;
  }

  const project = await getProjectById(bid.project_id);
  if (!project) {
    const error = new Error('Project not found');
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  if (project.client_id !== clientId) {
    const error = new Error('Unauthorized: you are not the owner of this project');
    error.code = 'UNAUTHORIZED';
    throw error;
  }

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO contracts (bid_id, project_id, client_id, freelancer_id, agreed_amount, started_at, ended_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [bid_id, bid.project_id, clientId, bid.freelancer_id, bid.bid_amount, started_at, ended_at]
    );

    const contract = result.rows[0];

    await client.query('UPDATE bids SET status = $1 WHERE id = $2', ['accepted', bid_id]);

    await client.query('UPDATE projects SET status = $1 WHERE id = $2', ['closed', bid.project_id]);

    await client.query('COMMIT');
    return contract;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateContractForClient(contractId, clientId, payload) {
  const allowed = ['status', 'started_at', 'ended_at'];
  const fields = [];
  const values = [];
  let idx = 1;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      fields.push(`${key} = $${idx}`);
      values.push(payload[key]);
      idx += 1;
    }
  }

  if (fields.length === 0) {
    return getContractByIdAndClientId(contractId, clientId);
  }

  const newStatus = payload.status;
  let bidStatusUpdate = null;

  if (newStatus === 'completed') {
    bidStatusUpdate = 'withdrawn';
  } else if (newStatus === 'cancelled') {
    bidStatusUpdate = 'rejected';
  }

  values.push(contractId, clientId);

  if (bidStatusUpdate) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const updateResult = await client.query(
        `UPDATE contracts
         SET ${fields.join(', ')}
         WHERE id = $${idx} AND client_id = $${idx + 1}
         RETURNING *`,
        values
      );

      const contract = updateResult.rows[0];

      if (contract) {
        await client.query('UPDATE bids SET status = $1 WHERE id = $2', [bidStatusUpdate, contract.bid_id]);
      }

      await client.query('COMMIT');
      return contract || null;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const result = await db.query(
      `UPDATE contracts
       SET ${fields.join(', ')}
       WHERE id = $${idx} AND client_id = $${idx + 1}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }
}

module.exports = {
  createContractForClient,
  updateContractForClient,
  getContractById,
  getContractByIdAndClientId,
};
