import express from "express";
import userController from "../controllers/userController.js";
import authController from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Password change route
router.post(
  "/change-password",
  authMiddleware.isAuthenticated,
  authController.changePassword,
);

router.get(
  "/change-password",
  authMiddleware.isAuthenticated,
  authController.renderChangePassword,
);

// Route to view user profile
router.get(
  "/profile",
  authMiddleware.isAuthenticated,
  userController.viewProfile,
);

// Route to delete user profile
router.delete(
  "/profile",
  authMiddleware.isAuthenticated,
  userController.deleteProfile,
);

// Logout route
router.get("/logout", authMiddleware.isAuthenticated, authController.logout);

export default router;
