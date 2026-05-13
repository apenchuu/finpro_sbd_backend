const freelancerSkillService = require('../services/freelancerSkillService');

async function addSkill(req, res) {
  try {
    const userId = req.user.id;
    const { skill_id, skill_name, level } = req.body;
    if (!level) return res.status(400).json({ error: 'level is required' });

    const skill = await freelancerSkillService.addSkillForUser(userId, { skill_id, skill_name, level });
    return res.status(201).json({ skill });
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes('required')) return res.status(400).json({ error: err.message });
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteSkill(req, res) {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;
    const removed = await freelancerSkillService.removeSkillForUser(userId, skillId);
    if (!removed) return res.status(404).json({ error: 'Skill mapping not found' });
    return res.json({ removed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { addSkill, deleteSkill };
