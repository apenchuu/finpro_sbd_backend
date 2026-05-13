const express = require('express');
const router = express.Router();
const controller = require('../controllers/freelancerProfileController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/me', controller.createOrGetMyProfile);
router.get('/all', controller.getAllProfiles);
router.get('/:profileId', controller.getProfileById);
router.post('/me', controller.createOrGetMyProfile);
router.put('/me', controller.updateMyProfile);

module.exports = router;
