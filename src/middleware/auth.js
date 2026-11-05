const jwt = require('jsonwebtoken');
const { User } = require('../models');
module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''; const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success:false, message:'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(payload.sub);
    if (!user || user.status !== 'active') return res.status(401).json({ success:false, message:'Invalid or inactive account' });
    req.user = user; next();
  } catch (e) { return res.status(401).json({ success:false, message:'Invalid or expired access token' }); }
};
