const db = require('../database');

async function getProjectById(projectId) {
  const result = await db.query('SELECT id, client_id, status FROM projects WHERE id = $1', [projectId]);
  return result.rows[0] || null;
}

async function getBidById(bidId) {
  const result = await db.query('SELECT * FROM bids WHERE id = $1', [bidId]);
  return result.rows[0] || null;
}

async function getBidByIdAndFreelancerId(bidId, freelancerId) {
  const result = await db.query('SELECT * FROM bids WHERE id = $1 AND freelancer_id = $2', [bidId, freelancerId]);
  return result.rows[0] || null;
}

async function createBidForFreelancer(freelancerId, payload) {
  const { project_id, cover_letter = null, bid_amount, delivery_days = null } = payload;

  const project = await getProjectById(project_id);
  if (!project) {
    const error = new Error('Project not found');
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  if (project.status !== 'open') {
    const error = new Error('Project is not open for bids');
    error.code = 'PROJECT_NOT_OPEN';
    throw error;
  }

  const result = await db.query(
    `INSERT INTO bids (freelancer_id, project_id, cover_letter, bid_amount, delivery_days)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [freelancerId, project_id, cover_letter, bid_amount, delivery_days]
  );

  return result.rows[0];
}

async function updateBidForFreelancer(bidId, freelancerId, payload) {
  const allowed = ['cover_letter', 'bid_amount', 'delivery_days'];
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
    return getBidByIdAndFreelancerId(bidId, freelancerId);
  }

  values.push(bidId, freelancerId);
  const result = await db.query(
    `UPDATE bids
     SET ${fields.join(', ')}
     WHERE id = $${idx} AND freelancer_id = $${idx + 1}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

async function deleteBidForFreelancer(bidId, freelancerId) {
  const result = await db.query('DELETE FROM bids WHERE id = $1 AND freelancer_id = $2 RETURNING *', [bidId, freelancerId]);
  return result.rows[0] || null;
}

module.exports = {
  createBidForFreelancer,
  updateBidForFreelancer,
  deleteBidForFreelancer,
  getBidById,
  getBidByIdAndFreelancerId,
};
