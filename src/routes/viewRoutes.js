import express from 'express';

const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('index');
});
router.get('/change-password', (req, res) => {
    res.render('changePassword');
});
router.get('/forgot-password', (req, res) => {
    res.render('forgotPassword');
});
router.get('/login', (req, res) => {
    res.render('login');
});
router.get('/profile', (req, res) => {
    res.render('profile');
});
router.get('/reset-password', (req, res) => {
    res.render('resetPassword');
});
router.get('/signup', (req, res) => {
    res.render('signup');
});

export default router;