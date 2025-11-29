
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        if (!user) return res.status(401).json({ message: 'Invalid token: user not found' });
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized', detail: err.message });
    }
};

module.exports = auth;
