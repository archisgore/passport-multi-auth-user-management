import User from '../models/user.js';
import passport from 'passport';
import bcrypt from 'bcrypt';

const authController = {};
// Sign up a new user
authController.signup = async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    try {
        if (password !== confirmPassword) return res.status(400).send('Passwords do not match');
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ email, password: hashedPassword });
        req.login(newUser, (err) => {
            if (err) return res.status(500).send('Login failed');
            return res.redirect('/profile');
        });
    } catch (error) {
        console.error(`Error signing up: ${error}, ${error.stack}`);
        res.status(400).send('Error signing up');
    }
};

// Log in an existing user
authController.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).send('Invalid credentials');
        console.log('user', user, 'info', info, 'next', next, 'err', err);
        req.login(user, (err) => {
            if (err) return next(err);
            return res.redirect('/profile');
        });
    })(req, res, next);
};


// Render forgot password page
authController.renderForgotPassword = (req, res) => {
    res.render('forgotPassword');
};

// Handle forgot password
authController.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).send('User not found');

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.GMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/auth/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.send('An email has been sent to ' + user.email + ' with further instructions.');
    } catch (error) {
        console.error(`Error sending email: ${error}, ${error.stack}`);
        res.status(500).send('Error sending email');
    }
};

// Render reset password page
authController.renderResetPassword = async (req, res) => {
    const { token } = req.params;
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).send('Password reset token is invalid or has expired');
        res.render('resetPassword', { token });
    } catch (error) {
        console.error(`Error rendering reset password page: ${error}, ${error.stack}`);
        res.status(500).send('Error rendering reset password page');
    }
};

// Handle reset password
authController.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).send('Passwords do not match');
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).send('Password reset token is invalid or has expired');

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.send('Password has been reset successfully');
    } catch (error) {
        console.error(`Error resetting password: ${error}, ${error.stack}`);
        res.status(500).send('Error resetting password');
    }
};

// Reset password
authController.changePassword = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).send('User not found');
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        
        res.send('Password changed successfully');
    } catch (error) {
        console.error(`Error changing password: ${error}, ${error.stack}`);
        res.status(400).send('Error changing password');
    }
};

// Delete user profile
authController.deleteProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        await User.destroy({ where: { id: userId } });
        req.logout();
        res.send('Profile deleted successfully');
    } catch (error) {
        console.error(`Error deleting profile: ${error}, ${error.stack}`);
        res.status(400).send('Error deleting profile');
    }
};

// Logout user
authController.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};

export default authController;