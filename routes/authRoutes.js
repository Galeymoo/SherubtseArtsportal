const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

// Email verification
router.get('/verify-email', authController.verifyEmail);

// Login
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

// Forgot password
router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.resetPassword);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
