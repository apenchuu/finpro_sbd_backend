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

async function getAllSkills(req, res) {
  try {
    const userId = req.user.id;
    const skills = await freelancerSkillService.getAllSkills(userId);
    return res.json({ skills });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getSkillById(req, res) {
  try {
    const userId = req.user.id;
    const { skillId } = req.params;
    const skill = await freelancerSkillService.getSkillById(userId, skillId);
    if (!skill) return res.status(404).json({ error: 'Skill not found for this user' });
    return res.json({ skill });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = { addSkill, deleteSkill, getAllSkills, getSkillById };
