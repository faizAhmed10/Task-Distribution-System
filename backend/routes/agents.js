const express = require('express');
const {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent
} = require('../controllers/agents');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getAgents)
  .post(protect, authorize('admin'), createAgent);

router
  .route('/:id')
  .get(protect, authorize('admin'), getAgent)
  .put(protect, authorize('admin'), updateAgent)
  .delete(protect, authorize('admin'), deleteAgent);

module.exports = router;