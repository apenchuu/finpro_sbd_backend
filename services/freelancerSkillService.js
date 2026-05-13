const db = require('../database');

async function getProfileIdByUserId(userId) {
  const res = await db.query('SELECT id FROM freelancer_profiles WHERE freelancer_id = $1', [userId]);
  return res.rows[0] ? res.rows[0].id : null;
}

async function ensureSkillByName(name) {
  const res = await db.query('INSERT INTO skills (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id, name', [name]);
  return res.rows[0];
}

async function addSkillForUser(userId, { skill_id = null, skill_name = null, level }) {
  if (!skill_id && !skill_name) throw new Error('skill_id or skill_name required');
  const profileId = await getProfileIdByUserId(userId);
  if (!profileId) throw new Error('Profile not found');

  let skillId = skill_id;
  if (!skillId && skill_name) {
    const skill = await ensureSkillByName(skill_name);
    skillId = skill.id;
  }

  const result = await db.query(
    `INSERT INTO freelancer_skill (freelancer_id, skill_id, level)
     VALUES ($1, $2, $3)
     ON CONFLICT (freelancer_id, skill_id) DO NOTHING
     RETURNING *`,
    [profileId, skillId, level]
  );

  if (result.rows[0]) return result.rows[0];

  const existing = await db.query('SELECT * FROM freelancer_skill WHERE freelancer_id = $1 AND skill_id = $2', [profileId, skillId]);
  return existing.rows[0] || null;
}

async function removeSkillForUser(userId, skillId) {
  const profileId = await getProfileIdByUserId(userId);
  if (!profileId) return null;
  const result = await db.query('DELETE FROM freelancer_skill WHERE freelancer_id = $1 AND skill_id = $2 RETURNING *', [profileId, skillId]);
  return result.rows[0] || null;
}

async function getAllSkills(userId) {
  const profileId = await getProfileIdByUserId(userId);
  if (!profileId) return [];
  const result = await db.query('SELECT fs.*, s.name FROM freelancer_skill fs JOIN skills s ON fs.skill_id = s.id WHERE fs.freelancer_id = $1', [profileId]);
  return result.rows;
}

async function getSkillById(userId, skillId) {
  const profileId = await getProfileIdByUserId(userId);
  if (!profileId) return null;
  const result = await db.query('SELECT fs.*, s.name FROM freelancer_skill fs JOIN skills s ON fs.skill_id = s.id WHERE fs.freelancer_id = $1 AND fs.skill_id = $2', [profileId, skillId]);
  return result.rows[0] || null;
}

module.exports = { addSkillForUser, removeSkillForUser, getAllSkills, getSkillById };
