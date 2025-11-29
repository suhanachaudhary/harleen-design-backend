
const jwt = require('jsonwebtoken');

const createAccessToken = (payload) => {
    const secret = process.env.JWT_ACCESS_SECRET;
    const expiresIn = process.env.ACCESS_TOKEN_EXPIRES || '1h';
    return jwt.sign(payload, secret, { expiresIn });
};

const createRefreshToken = (payload) => {
    const secret = process.env.JWT_REFRESH_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES || '7d';
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
