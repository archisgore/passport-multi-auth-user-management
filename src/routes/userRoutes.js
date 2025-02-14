import express from 'express'
import userController from '../controllers/userController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

// Password change route
router.post(
    '/change-password',
    authMiddleware.isAuthenticated,
    userController.changePassword
)

router.get(
    '/change-password',
    authMiddleware.isAuthenticated,
    userController.renderChangePassword
)

// Route to view user profile
router.get(
    '/profile',
    authMiddleware.isAuthenticated,
    userController.viewProfile
)

// Route to delete user profile
router.post(
    '/profile/delete',
    authMiddleware.isAuthenticated,
    userController.deleteProfile
)

router.get('/verify-email', userController.renderVerifyEmail)

// Logout route
router.get('/logout', authMiddleware.isAuthenticated, userController.logout)

export default router
