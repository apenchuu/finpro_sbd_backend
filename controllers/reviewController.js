const reviewService = require('../services/reviewService');

async function createReview(req, res) {
  try {
    const clientId = req.user.id;
    const { contract_id, rating, comment } = req.body || {};

    if (!contract_id) {
      return res.status(400).json({ error: 'contract_id is required' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: 'rating must be an integer between 1 and 5' });
    }

    const review = await reviewService.createReviewForClient(clientId, {
      contract_id,
      rating: numericRating,
      comment,
    });

    return res.status(201).json({ review });
  } catch (err) {
    console.error(err);

    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }

    if (err.code === 'CONTRACT_NOT_FOUND_OR_FORBIDDEN') {
      return res.status(404).json({ error: 'Contract not found or not owned by this client' });
    }

    if (err.code === 'CONTRACT_NOT_COMPLETED') {
      return res.status(400).json({ error: 'Review can only be created for completed contracts' });
    }

    if (err.code === 'REVIEW_ALREADY_EXISTS') {
      return res.status(409).json({ error: 'You already reviewed this contract' });
    }

    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already reviewed this contract' });
    }

    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createReview,
};
