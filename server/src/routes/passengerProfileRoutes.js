const express = require('express');
const router = express.Router();
const { getPassengerProfile, updatePassengerProfile } = require('../controllers/passengerProfileController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/me', verifyToken, getPassengerProfile);
router.put('/me', verifyToken, updatePassengerProfile);

module.exports = router;
