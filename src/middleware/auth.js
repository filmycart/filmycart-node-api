
const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
    try {
        // Get Authorization header
        const header = req.headers.authorization || '';

        // Extract Bearer token
        const token = header.startsWith('Bearer ')
            ? header.slice(7)
            : null;

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Verify JWT access token
        const payload = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET
        );

        // Find user by ID
        const user = await User.findByPk(payload.sub);

        // Validate user status
        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or inactive account'
            });
        }

        // Attach authenticated user to request
        req.user = user;

        // Continue to next middleware/controller
        return next();

    } catch (e) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired access token'
        });
    }
};
