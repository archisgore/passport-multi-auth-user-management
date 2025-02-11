import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// Signup route
router.post('/signup', authController.signup);

// Login route
router.post('/login', authController.login);

// Password reset form route
router.get('/forgot-password', authController.renderForgotPassword);
// Password reset request route
router.post('/forgot-password', authController.forgotPassword);

// Password reset form route
router.get('/reset-password/:token', authController.renderResetPassword);
// Password reset route
router.post('/reset-password/:token', authController.resetPassword);

// Password change route
router.post('/change-password', authController.changePassword);

// Logout route
router.get('/logout', authController.logout);

export default router;