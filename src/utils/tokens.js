const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate access token
const access = (user) => {
    return jwt.sign(
        {
            sub: String(user.id),
            role: user.role
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m'
        }
    );
};

// Generate refresh token
const refresh = (user) => {
    return jwt.sign(
        {
            sub: String(user.id),
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d'
        }
    );
};

// Generate SHA-256 hash of token
const hash = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

// Export token utilities
module.exports = {
    access,
    refresh,
    hash
};