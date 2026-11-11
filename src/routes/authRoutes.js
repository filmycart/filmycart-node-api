const express = require('express');
const { body } = require('express-validator');

const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middlewares/validate');

// Register User
router.post(
    '/register',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 120 })
            .withMessage('Name must be between 2 and 120 characters'),

        body('email')
            .trim()
            .toLowerCase()
            .isEmail()
            .withMessage('Please provide a valid email address'),

        body('password')
            .isLength({ min: 10 })
            .withMessage('Password must contain at least 10 characters')
            .matches(/[A-Za-z]/)
            .withMessage('Password must contain at least one letter')
            .matches(/[0-9]/)
            .withMessage('Password must contain at least one number'),

        body('phone')
            .optional()
            .isMobilePhone('any')
            .withMessage('Please provide a valid phone number')
    ],
    validate,
    authController.register
);

module.exports = router;
