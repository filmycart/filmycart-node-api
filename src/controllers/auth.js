const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User, RefreshToken } = require('../models');
const tokens = require('../utils/tokens');

// Register User
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, E-Mail and Password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                existingUser,
                success: false,
                message: 'Email Already Registered.'
            });
        }

        const passwordHash = await bcrypt.hash(
            password,
            Number(process.env.BCRYPT_ROUNDS || 12)
        );

        const user = await User.create({
            name,
            email,
            password:passwordHash,
            phone
        });

        console.log("user",user);

        return res.status(201).json({
            success: true,
            data: {
                user,
                accessToken: tokens.access(user),
                refreshToken: await issueRefresh(user)
            }
        });

    } catch (e) {
        next(e);
    }
};

// Register User
exports.adminRegister = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, E-Mail and Password are required'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters'
            });
        }

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(409).json({
                existingUser,
                success: false,
                message: 'Email Already Registered.'
            });
        }

        const passwordHash = await bcrypt.hash(
            password,
            Number(process.env.BCRYPT_ROUNDS || 12)
        );

        const user = await User.create({
            name,
            email,
            password:passwordHash,
            phone,
            role
        });

        console.log("req.body",req.body);

        return res.status(201).json({
            success: true,
            data: {
                user,
                accessToken: tokens.access(user),
                refreshToken: await issueRefresh(user)
            }
        });

    } catch (e) {
        next(e);
    }
};

// Generate and Store Refresh Token
async function issueRefresh(user) {
    const token = tokens.refresh(user);
    const decoded = jwt.decode(token);

    await RefreshToken.create({
        userId: user.id,
        tokenHash: tokens.hash(token),
        expiresAt: new Date(decoded.exp * 1000)
    });

    return token;
}

// Login User
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.unscoped().findOne({
            where: {
                email: email.trim().toLowerCase()
            }
        });

        // Check user existence
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'+bcrypt.hash(req.body.password)
            });
        }

        // Check account status
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive'
            });
        }

        // Validate password
        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Remove sensitive information
        const safe = user.toJSON();
        delete safe.password;

        // Generate authentication tokens
        const accessToken = tokens.access(user);
        const refreshToken = await issueRefresh(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: safe,
                accessToken,
                refreshToken
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        next(error);
    }
};

// Refresh Access Token
exports.refresh = async (req, res, next) => {
    try {
        const token = req.body.refreshToken;

        const p = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        if (p.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        const row = await RefreshToken.findOne({
            where: {
                userId: p.sub,
                tokenHash: tokens.hash(token),
                revokedAt: null,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!row) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token revoked or expired'
            });
        }

        // Revoke the old refresh token
        row.revokedAt = new Date();
        await row.save();

        const user = await User.findByPk(p.sub);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            data: {
                accessToken: tokens.access(user),
                refreshToken: await issueRefresh(user)
            }
        });

    } catch (e) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
};

// Logout User
exports.logout = async (req, res, next) => {
    try {
        const token = req.body.refreshToken;

        if (token) {
            await RefreshToken.update(
                {
                    revokedAt: new Date()
                },
                {
                    where: {
                        userId: req.user.id,
                        tokenHash: tokens.hash(token),
                        revokedAt: null
                    }
                }
            );
        }

        return res.json({
            success: true,
            message: 'Logged out'
        });

    } catch (e) {
        next(e);
    }
};

// Get Authenticated User
exports.me = (req, res) => {
    return res.json({
        success: true,
        data: {
            user: req.user
        }
    });
};