
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { allowRoles } = require('../middleware/roles');
const upload = require('../middleware/upload');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// List all users (Admin only) - supports pagination, sort, search/filter
router.get('/', auth, allowRoles('admin'), getUsers);

// Get single user (admin or owner)
router.get('/:id', auth, getUserById);

// Update user (admin or owner). Allow profile_image change.
router.put('/:id', auth, upload.single('profile_image'), updateUser);

// Delete user (admin only)
router.delete('/:id', auth, allowRoles('admin'), deleteUser);

module.exports = router;
