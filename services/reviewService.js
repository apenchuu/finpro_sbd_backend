const db = require('../database');

async function getCompletedContractByIdAndClientId(contractId, clientId) {
  const result = await db.query(
    'SELECT id, client_id, freelancer_id, status FROM contracts WHERE id = $1 AND client_id = $2',
    [contractId, clientId]
  );
  return result.rows[0] || null;
}

async function getReviewByClientAndContract(clientId, contractId) {
  const result = await db.query('SELECT id FROM reviews WHERE client_id = $1 AND contract_id = $2', [clientId, contractId]);
  return result.rows[0] || null;
}

async function createReviewForClient(clientId, payload) {
  const { contract_id, rating, comment = null } = payload;

  if (!contract_id) {
    const error = new Error('contract_id is required');
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  const contract = await getCompletedContractByIdAndClientId(contract_id, clientId);
  if (!contract) {
    const error = new Error('Contract not found or not owned by this client');
    error.code = 'CONTRACT_NOT_FOUND_OR_FORBIDDEN';
    throw error;
  }

  if (contract.status !== 'completed') {
    const error = new Error('Review can only be created for completed contracts');
    error.code = 'CONTRACT_NOT_COMPLETED';
    throw error;
  }

  const existingReview = await getReviewByClientAndContract(clientId, contract_id);
  if (existingReview) {
    const error = new Error('Review for this contract by this client already exists');
    error.code = 'REVIEW_ALREADY_EXISTS';
    throw error;
  }

  const result = await db.query(
    `INSERT INTO reviews (contract_id, client_id, freelancer_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [contract_id, clientId, contract.freelancer_id, rating, comment]
  );

  return result.rows[0];
}

async function getAllReviews(clientId) {
  const result = await db.query('SELECT * FROM reviews WHERE client_id = $1', [clientId]);
  return result.rows;
}

async function getReviewById(reviewId) {
  const result = await db.query('SELECT * FROM reviews WHERE id = $1', [reviewId]);
  return result.rows[0] || null;
}

module.exports = {
  createReviewForClient,
  getAllReviews,
  getReviewById,
};
