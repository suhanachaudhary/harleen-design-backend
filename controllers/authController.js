
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators/userValidator');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/token');

const register = async (req, res, next) => {
    try {
        // parse body (for multipart)
        const body = Object.assign({}, req.body);
        const { error } = registerSchema.validate(body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // check unique email
        const existing = await User.findOne({ email: body.email });
        if (existing) return res.status(409).json({ message: 'Email already registered' });

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(body.password, salt);

        const userData = {
            name: body.name,
            email: body.email,
            phone: body.phone,
            password: hashed,
            address: body.address || '',
            state: body.state,
            city: body.city,
            country: body.country,
            pincode: body.pincode || '',
            role: body.role || 'user'
        };

        if (req.file) {
            // stored as /uploads/filename
            userData.profile_image = `/uploads/${req.file.filename}`;
        }

        const user = new User(userData);
        await user.save();

        // don't return password or tokens directly
        const payload = { id: user._id, role: user.role };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        // store refresh token (rotation)
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.status(201).json({
            message: 'User registered',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { identifier, password } = req.body;
        // find by email or phone
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const payload = { id: user._id, role: user.role };
        const accessToken = createAccessToken(payload);
        const refreshToken = createRefreshToken(payload);

        // Store refresh token
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.json({
            message: 'Logged in',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_image: user.profile_image
            },
            accessToken,
            refreshToken
        });
    } catch (err) {
        next(err);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        // verify token
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(401).json({ message: 'User not found' });

        // check if refresh token exists in DB (rotation)
        const tokenIndex = user.refreshTokens.findIndex(rt => rt.token === refreshToken);
        if (tokenIndex === -1) {
            // token not found (could be reused) -> clear all and require re-login
            user.refreshTokens = [];
            await user.save();
            return res.status(401).json({ message: 'Refresh token not recognized. Please login again.' });
        }

        // Remove used token (rotation) and add a new one
        user.refreshTokens.splice(tokenIndex, 1);

        const payload = { id: user._id, role: user.role };
        const newAccessToken = createAccessToken(payload);
        const newRefreshToken = createRefreshToken(payload);

        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();

        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        next(err);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

        // verify to get id (if invalid still remove)
        try {
            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.id);
            if (user) {
                user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
                await user.save();
            } 0
        } catch (err) {
            // token invalid or expired - nothing to remove
        }

        res.json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout
};
