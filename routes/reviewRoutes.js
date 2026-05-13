const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);
router.use(requireRole('client'));

router.get('/', controller.getAllReviews);
router.get('/:reviewId', controller.getReviewById);
router.post('/', controller.createReview);

module.exports = router;
