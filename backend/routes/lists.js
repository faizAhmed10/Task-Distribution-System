const express = require('express');
const multer = require('multer');
const {
  uploadList,
  getLists,
  getListByBatch,
  getListByAgent,
  assignTaskToAgent,
  deleteBatch
} = require('../controllers/lists');
const { protect, authorize } = require('../middleware/auth');

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getLists);

router
  .route('/upload')
  .post(protect, authorize('admin'), upload.single('file'), uploadList);

router
  .route('/agent/:agentId')
  .get(protect, authorize('admin'), getListByAgent);

router
  .route('/assign/:itemId')
  .put(protect, authorize('admin'), assignTaskToAgent);

router
  .route('/:batch')
  .get(protect, authorize('admin'), getListByBatch)
  .delete(protect, authorize('admin'), deleteBatch);

module.exports = router;