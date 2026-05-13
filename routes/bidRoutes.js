const express = require('express');
const router = express.Router();
const controller = require('../controllers/bidController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);
router.use(requireRole('freelancer'));

router.get('/', controller.getAllBids);
router.get('/:bidId', controller.getBidById);
router.post('/', controller.createBid);
router.put('/:bidId', controller.updateBid);
router.delete('/:bidId', controller.deleteBid);

module.exports = router;
