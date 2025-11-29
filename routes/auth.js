
const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout } = require('../controllers/authController');
const upload = require('../middleware/upload');

// Register (multipart/form-data because of image)
router.post('/register', upload.single('profile_image'), register);

// Login
router.post('/login', login);

// Refresh
router.post('/refresh', refreshToken);

// Logout
router.post('/logout', logout);

module.exports = router;
