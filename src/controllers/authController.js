import User from '../models/user.js'
import passport from 'passport'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import emailer from '../config/emailer.js'
import querystring from 'querystring';

const authController = {}
// Sign up a new user
authController.signup = async (req, res) => {
    const { email, password, confirmPassword } = req.body
    try {
        if (password !== confirmPassword)
            return res.status(400).send('Passwords do not match')
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ email, password: hashedPassword })
        req.login(newUser, (err) => {
            if (err) return res.status(500).send('Login failed')
            return res.redirect('/user/profile')
        })
    } catch (error) {
        console.error(`Error signing up: ${error}, ${error.stack}`)
        res.status(400).send('Error signing up')
    }
}

// Render the signup page
authController.renderSignup = async (req, res) => {
    res.render('signup')
}

// Log in an existing user
authController.login = (req, res, next) => {
    passport.authenticate('local', (err, user, _info) => {
        if (err) return next(err)
        if (!user) return res.status(401).send('Invalid credentials')
        req.login(user, (err) => {
            if (err) return next(err)
            return res.redirect('/user/profile')
        })
    })(req, res, next)
}

// Render Login page
authController.renderLogin = (_req, res) => {
    res.render('login')
}

// Render forgot password page
authController.renderForgotPassword = (_req, res) => {
    res.render('forgotPassword')
}

// Handle forgot password
authController.forgotPassword = async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(404).send('User not found')

        const token = crypto.randomBytes(20).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
        await User.save(user)

        const mailOptions = {
            to: user.email,
            from: process.env.GMAIL_USER,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/auth/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        }

        await emailer.sendMail(mailOptions)
        res.send(
            'An email has been sent to ' +
            user.email +
            ' with further instructions.'
        )
    } catch (error) {
        console.error(`Error sending email: ${error}, ${error.stack}`)
        res.status(500).send('Error sending email')
    }
}

// Render reset password page
authController.renderResetPassword = async (req, res) => {
    const { token } = req.params
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })
        if (!user)
            return res
                .status(400)
                .send('Password reset token is invalid or has expired')
        res.render('resetPassword', { token })
    } catch (error) {
        console.error(
            `Error rendering reset password page: ${error}, ${error.stack}`
        )
        res.status(500).send('Error rendering reset password page')
    }
}

// Handle reset password
authController.resetPassword = async (req, res) => {
    const { token } = req.params
    const { password, confirmPassword } = req.body
    if (password !== confirmPassword)
        return res.status(400).send('Passwords do not match')
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        })
        if (!user)
            return res
                .status(400)
                .send('Password reset token is invalid or has expired')

        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined
        await User.save(user)

        res.send('Password has been reset successfully')
    } catch (error) {
        console.error(`Error resetting password: ${error}, ${error.stack}`)
        res.status(500).send('Error resetting password')
    }
}

// Send Magic Link
authController.loginEmail = async (req, res) => {
    passport.authenticate('magiclink', {
        action: 'requestToken',
        failureRedirect: '/login'
    });
    res.render("checkEmail", { email: req.body.email });
}

authController.renderLoginEmail = async (req, res) => {
    res.render('loginEmail')
}

export default authController
