
const User = require('../models/User');
const { updateSchema } = require('../validators/userValidator');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const getUsers = async (req, res, next) => {
    try {
        // pagination & sorting & filter
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const sort = req.query.sort || '-created_at';

        // filters: search by q or specific fields
        const q = req.query.q;
        const filter = {};
        if (q) {
            filter.$text = { $search: q };
        }
        if (req.query.name) filter.name = new RegExp(req.query.name, 'i');
        if (req.query.email) filter.email = new RegExp(req.query.email, 'i');
        if (req.query.state) filter.state = new RegExp(req.query.state, 'i');
        if (req.query.city) filter.city = new RegExp(req.query.city, 'i');

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password -refreshTokens')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        res.json({
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (err) {
        next(err);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });

        const user = await User.findById(id).select('-password -refreshTokens');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // if requester is not admin and not owner -> forbidden
        const requester = req.user;
        if (requester.role !== 'admin' && requester._id.toString() !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        res.json({ data: user });
    } catch (err) {
        next(err);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });

        const requester = req.user;
        if (requester.role !== 'admin' && requester._id.toString() !== id) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const body = Object.assign({}, req.body);
        const { error } = updateSchema.validate(body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // if updating password
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            body.password = await bcrypt.hash(body.password, salt);
        }

        if (req.file) {
            body.profile_image = `/uploads/${req.file.filename}`;
        }

        body.updated_at = new Date();

        // If email is changed, ensure uniqueness
        if (body.email) {
            const exists = await User.findOne({ email: body.email, _id: { $ne: id } });
            if (exists) return res.status(409).json({ message: 'Email already in use' });
        }

        const updated = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select('-password -refreshTokens');
        res.json({ message: 'User updated', data: updated });
    } catch (err) {
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid user id' });
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
