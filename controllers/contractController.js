const contractService = require('../services/contractService');

async function createContract(req, res) {
  try {
    const clientId = req.user.id;
    const { bid_id, started_at, ended_at } = req.body || {};

    if (!bid_id) {
      return res.status(400).json({ error: 'bid_id is required' });
    }

    const contract = await contractService.createContractForClient(clientId, {
      bid_id,
      started_at,
      ended_at,
    });

    return res.status(201).json({ contract });
  } catch (err) {
    console.error(err);

    if (err.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: err.message });
    }

    if (err.code === 'BID_NOT_FOUND') {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (err.code === 'PROJECT_NOT_FOUND') {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (err.code === 'UNAUTHORIZED') {
      return res.status(403).json({ error: err.message });
    }

    if (err && err.code === '23505') {
      return res.status(409).json({ error: 'Contract already exists for this bid or project' });
    }

    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateContract(req, res) {
  try {
    const clientId = req.user.id;
    const { contractId } = req.params;
    const { status } = req.body || {};

    if (status != null) {
      const allowedStatus = ['on_progress', 'completed', 'cancelled'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Use: on_progress, completed, cancelled' });
      }
    }

    const contract = await contractService.updateContractForClient(contractId, clientId, req.body || {});
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found or not owned by this client' });
    }

    return res.json({ contract });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createContract,
  updateContract,
};
