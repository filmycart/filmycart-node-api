const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const access = (user) => jwt.sign({ sub: String(user.id), role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
const refresh = (user) => jwt.sign({ sub: String(user.id), type: 'refresh' }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '30d' });
const hash = (token) => crypto.createHash('sha256').update(token).digest('hex');
module.exports = { access, refresh, hash };
