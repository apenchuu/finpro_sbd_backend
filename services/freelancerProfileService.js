const db = require('../database');

const DEFAULT_PROFILE_FIELDS = {
  headline: null,
  bio: null,
  portfolio_url: null,
  avatar_url: null,
  hourly_rate: null,
  country: null,
};

async function createDefaultProfile(freelancerId) {
  const result = await db.query(
    `INSERT INTO freelancer_profiles (
      freelancer_id,
      headline,
      bio,
      portfolio_url,
      avatar_url,
      hourly_rate,
      country
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (freelancer_id) DO NOTHING
    RETURNING *`,
    [
      freelancerId,
      DEFAULT_PROFILE_FIELDS.headline,
      DEFAULT_PROFILE_FIELDS.bio,
      DEFAULT_PROFILE_FIELDS.portfolio_url,
      DEFAULT_PROFILE_FIELDS.avatar_url,
      DEFAULT_PROFILE_FIELDS.hourly_rate,
      DEFAULT_PROFILE_FIELDS.country,
    ]
  );

  if (result.rows[0]) return result.rows[0];

  const existing = await getByFreelancerId(freelancerId);
  return existing;
}

async function getByFreelancerId(freelancerId) {
  const result = await db.query('SELECT * FROM freelancer_profiles WHERE freelancer_id = $1', [freelancerId]);
  return result.rows[0] || null;
}

async function updateProfile(freelancerId, payload) {
  const current = await getByFreelancerId(freelancerId);
  if (!current) {
    await createDefaultProfile(freelancerId);
  }

  const fields = [];
  const values = [];
  let idx = 1;

  const allowed = ['headline', 'bio', 'portfolio_url', 'avatar_url', 'hourly_rate', 'country'];

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      fields.push(`${key} = $${idx}`);
      values.push(payload[key]);
      idx += 1;
    }
  }

  if (fields.length === 0) {
    return getByFreelancerId(freelancerId);
  }

  fields.push(`updated_at = NOW()`);
  values.push(freelancerId);

  const result = await db.query(
    `UPDATE freelancer_profiles
     SET ${fields.join(', ')}
     WHERE freelancer_id = $${idx}
     RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

module.exports = {
  createDefaultProfile,
  getByFreelancerId,
  updateProfile,
};
