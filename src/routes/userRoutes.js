import express from 'express';
import userController from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to view user profile
router.get('/profile', authMiddleware.isAuthenticated, userController.viewProfile);

// Route to delete user profile
router.delete('/profile', authMiddleware.isAuthenticated, userController.deleteProfile);

export default router;