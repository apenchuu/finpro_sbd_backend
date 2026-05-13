const projectService = require('../services/projectService');

function hasInvalidBudgetRange(budgetMin, budgetMax) {
  if (budgetMin == null || budgetMax == null) return false;
  return Number(budgetMin) > Number(budgetMax);
}

async function createProject(req, res) {
  try {
    const clientId = req.user.id;
    const {
      title,
      description = null,
      budget_min = null,
      budget_max = null,
      status = 'open',
      expires_at,
      expires_date,
      expries_date,
    } = req.body || {};

    const finalExpiresAt = expires_at ?? expires_date ?? expries_date ?? null;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    if (hasInvalidBudgetRange(budget_min, budget_max)) {
      return res.status(400).json({ error: 'budget_min cannot be greater than budget_max' });
    }

    const allowedStatus = ['open', 'progress', 'closed'];
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: open, progress, closed' });
    }

    const project = await projectService.createProjectForClient(clientId, {
      title,
      description,
      budget_min,
      budget_max,
      status,
      expires_at: finalExpiresAt,
    });
    return res.status(201).json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateProject(req, res) {
  try {
    const clientId = req.user.id;
    const { projectId } = req.params;
    const {
      title,
      description,
      budget_min,
      budget_max,
      status,
      expires_at,
      expires_date,
      expries_date,
    } = req.body || {};

    const finalExpiresAt = expires_at ?? expires_date ?? expries_date;

    if (hasInvalidBudgetRange(budget_min, budget_max)) {
      return res.status(400).json({ error: 'budget_min cannot be greater than budget_max' });
    }

    const allowedStatus = ['open', 'progress', 'closed'];
    if (status != null && !allowedStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Use: open, progress, closed' });
    }

    const payload = {};
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (budget_min !== undefined) payload.budget_min = budget_min;
    if (budget_max !== undefined) payload.budget_max = budget_max;
    if (status !== undefined) payload.status = status;
    if (finalExpiresAt !== undefined) payload.expires_at = finalExpiresAt;

    const project = await projectService.updateProjectForClient(projectId, clientId, payload);
    if (!project) {
      return res.status(404).json({ error: 'Project not found or not owned by this client' });
    }

    return res.json({ project });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteProject(req, res) {
  try {
    const clientId = req.user.id;
    const { projectId } = req.params;

    const deleted = await projectService.deleteProjectForClient(projectId, clientId);
    if (!deleted) {
      return res.status(404).json({ error: 'Project not found or not owned by this client' });
    }

    return res.json({ deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createProject,
  updateProject,
  deleteProject,
};
