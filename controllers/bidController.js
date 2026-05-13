const bidService = require('../services/bidService');

async function createBid(req, res) {
  try {
    const freelancerId = req.user.id;
    const { project_id, cover_letter, bid_amount, delivery_days } = req.body || {};

    if (!project_id) {
      return res.status(400).json({ error: 'project_id is required' });
    }

    if (bid_amount == null || Number.isNaN(Number(bid_amount))) {
      return res.status(400).json({ error: 'bid_amount is required and must be a number' });
    }

    const bid = await bidService.createBidForFreelancer(freelancerId, {
      project_id,
      cover_letter,
      bid_amount,
      delivery_days,
    });

    return res.status(201).json({ bid });
  } catch (err) {
    console.error(err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'You already bid on this project' });
    }

    if (err.code === 'PROJECT_NOT_FOUND') {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (err.code === 'PROJECT_NOT_OPEN') {
      return res.status(400).json({ error: 'Project is not open for bids' });
    }

    return res.status(500).json({ error: 'Server error' });
  }
}

async function updateBid(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;
    const { bid_amount } = req.body || {};

    if (bid_amount != null && Number.isNaN(Number(bid_amount))) {
      return res.status(400).json({ error: 'bid_amount must be a number' });
    }

    const bid = await bidService.updateBidForFreelancer(bidId, freelancerId, req.body || {});
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ bid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function deleteBid(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;

    const deleted = await bidService.deleteBidForFreelancer(bidId, freelancerId);
    if (!deleted) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getAllBids(req, res) {
  try {
    const freelancerId = req.user.id;
    const bids = await bidService.getAllBids(freelancerId);
    return res.json({ bids });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getBidById(req, res) {
  try {
    const freelancerId = req.user.id;
    const { bidId } = req.params;

    const bid = await bidService.getBidByIdAndFreelancerId(bidId, freelancerId);
    if (!bid) {
      return res.status(404).json({ error: 'Bid not found or not owned by this freelancer' });
    }

    return res.json({ bid });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  createBid,
  updateBid,
  deleteBid,
  getAllBids,
  getBidById,
};
