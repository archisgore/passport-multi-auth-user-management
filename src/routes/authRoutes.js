import express from 'express'
import authController from '../controllers/authController.js'
import 'dotenv/config.js'

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
// Render email check page
router.get('/login/email/check', authController.renderCheckLoginEmail)
// Render email check page
router.get('/login/email/verify', authController.verifyEmail)

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

if (process.env.GOOGLE_LOGIN === 'true') {
    router.get('/google', authController.googleLogin)

    router.get('/google/callback', authController.googleLoginVerify)
}

if (process.env.APPLE_LOGIN === 'true') {
    router.get('/apple', authController.appleLogin)

    router.post('/apple/callback', authController.appleLoginVerify)
}

export default router
