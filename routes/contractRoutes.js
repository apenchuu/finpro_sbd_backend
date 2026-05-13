const express = require('express');
const router = express.Router();
const controller = require('../controllers/contractController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);
router.use(requireRole('client'));

router.post('/', controller.createContract);
router.put('/:contractId', controller.updateContract);

module.exports = router;
