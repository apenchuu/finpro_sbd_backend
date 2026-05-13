const express = require('express');
const router = express.Router();
const controller = require('../controllers/projectController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);
router.use(requireRole('client'));

router.post('/', controller.createProject);
router.put('/:projectId', controller.updateProject);
router.delete('/:projectId', controller.deleteProject);

module.exports = router;
