const express = require('express');
const { login, getMe, setupAdmin } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/setup', setupAdmin);
router.get('/me', protect, getMe);

module.exports = router;