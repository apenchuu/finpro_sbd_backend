const freelancerProfileService = require('../services/freelancerProfileService');

async function createOrGetMyProfile(req, res) {
  try {
    const freelancerId = req.user.id;
    const profile = await freelancerProfileService.createDefaultProfile(freelancerId);
    return res.status(201).json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateMyProfile(req, res) {
  try {
    const freelancerId = req.user.id;
    const profile = await freelancerProfileService.updateProfile(freelancerId, req.body);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json({ profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createOrGetMyProfile,
  updateMyProfile,
};
