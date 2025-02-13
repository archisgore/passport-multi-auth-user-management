import express from 'express'
import authController from '../controllers/authController.js'

const router = express.Router()

// APIs
// Signup route
router.post('/signup', authController.signup)

// Login route
router.post('/login', authController.login)

// Render login page
router.get('/login', authController.renderLogin)

// Login with email
router.post('/login/email', authController.loginEmail)
// Render email login form
router.get('/login/email', authController.renderLoginEmail)

// Password reset form route
router.get('/forgot-password', authController.renderForgotPassword)
// Forgot password email form
router.post('/forgot-password', authController.forgotPassword)

// Password reset form route
router.get('/reset-password/:token', authController.renderResetPassword)
// Password reset route
router.post('/reset-password/:token', authController.resetPassword)

// Views
router.get('/signup', authController.renderSignup)

export default router
