const express = require('express');
const router = express.Router();
const controller = require('../controllers/freelancerSkillController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

router.use(authenticateToken);
router.use(requireRole('freelancer'));

router.get('/', controller.getAllSkills);
router.get('/:skillId', controller.getSkillById);
router.post('/', controller.addSkill);
router.delete('/:skillId', controller.deleteSkill);

module.exports = router;
