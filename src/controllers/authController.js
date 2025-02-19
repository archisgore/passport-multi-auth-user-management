import User from '../models/user.js'
import passport from 'passport'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import emailer from '../config/emailer.js'
import 'dotenv/config.js'

const authController = {
    // Sign up a new user
    signup: async (req, res) => {
        const { email, password, confirmPassword } = req.body
        try {
            if (password !== confirmPassword)
                return res.status(400).send('Passwords do not match')
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await User.create({
                email,
                password: hashedPassword,
            })
            req.login(newUser, (err) => {
                if (err) return res.status(500).send('Login failed')
                return res.redirect('/user/profile')
            })
        } catch (error) {
            console.error(`Error signing up: ${error}, ${error.stack}`)
            res.status(400).send('Error signing up')
        }
    },

    // Render the signup page
    renderSignup: async (req, res) => {
        res.render('signup')
    },

    // Log in an existing user
    login: (req, res, next) => {
        passport.authenticate('local', (err, user, _info) => {
            if (err) return next(err)
            if (!user) return res.status(401).send('Invalid credentials')
            req.login(user, (err) => {
                if (err) return next(err)
                return res.redirect('/user/profile')
            })
        })(req, res, next)
    },

    // Render Login page
    renderLogin: (_req, res) => {
        res.render('login')
    },

    // Render forgot password page
    renderForgotPassword: (_req, res) => {
        res.render('forgotPassword')
    },

    // Handle forgot password
    forgotPassword: async (req, res) => {
        const { email } = req.body
        try {
            const user = await User.findOne({ eq: { email } })
            if (!user)
                return res
                    .status(404)
                    .send(
                        'If an account for this user exists, an email has been sent to ' +
                            user.email +
                            ' with further instructions.'
                    )

            const token = crypto.randomBytes(20).toString('hex')
            user.reset_password_token = token
            user.reset_password_expires = new Date(Date.now() + 3600000) // 1 hour
            await User.save(user)

            const mailOptions = {
                to: user.email,
                from: process.env.FORGOT_PASSWORD_FROM_ADDRESS,
                subject: 'Password Reset',
                text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
            Please click on the following link, or paste this into your browser to complete the process:\n\n
            http://${req.headers.host}/auth/reset-password/${token}\n\n
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
            }

            await emailer.sendMail(mailOptions)
            res.send(
                'If an account for this user exists, an email has been sent to ' +
                    user.email +
                    ' with further instructions.'
            )
        } catch (error) {
            console.error('Error sending email:', error)
            res.status(500).send('Error sending email')
        }
    },

    // Render reset password page
    renderResetPassword: async (req, res) => {
        const { token } = req.params
        try {
            const user = await User.findOne({
                eq: {
                    reset_password_token: token,
                },
                gt: {
                    reset_password_expires: new Date(),
                },
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
    },

    // Handle reset password
    resetPassword: async (req, res) => {
        const { token } = req.params
        const { password, confirmPassword } = req.body
        if (password !== confirmPassword)
            return res.status(400).send('Passwords do not match')
        try {
            const user = await User.findOne({
                eq: {
                    reset_password_token: token,
                },
                gt: {
                    reset_password_expires: new Date(),
                },
            })
            if (!user)
                return res
                    .status(400)
                    .send('Password reset token is invalid or has expired')

            const hashedPassword = await bcrypt.hash(password, 10)
            user.password = hashedPassword
            user.reset_password_token = undefined
            user.reset_password_expires = undefined
            await User.save(user)

            res.send('Password has been reset successfully')
        } catch (error) {
            console.error(`Error resetting password: ${error}, ${error.stack}`)
            res.status(500).send('Error resetting password')
        }
    },

    // Send Magic Link
    loginEmail: async (req, res) => {
        passport.authenticate('magiclink', {
            action: 'requestToken',
            failureRedirect: '/auth/login',
        })(req, res, async (err) => {
            if (err) {
                console.error('Error during email login: ', err)
                return res.status(500).send('Error during email login')
            }
            res.redirect('/auth/login/email/check')
        })
    },

    renderCheckPasswordResetEmail: async (req, res) => {
        res.render('checkPasswordResetEmail')
    },

    renderCheckLoginEmail: async (req, res) => {
        res.render('checkLoginEmail')
    },

    renderLoginEmail: async (req, res) => {
        res.render('loginEmail')
    },

    verifyEmail: async (req, res) => {
        passport.authenticate('magiclink', {
            successReturnToOrRedirect: '/user/profile',
            failureRedirect: '/auth/login',
        })(req, res)
    },

    googleLogin: async (req, res) => {
        return passport.authenticate('google', { scope: ['email'] })(
            req,
            res,
            (err) => {
                if (err) {
                    console.error('Error during Google login: ', err)
                    return res.status(500).send('Error during Google login')
                }
                console.log('Handed off to Google for login successfully')
            }
        )
    },

    googleLoginVerify: async (req, res) => {
        return passport.authenticate('google', {
            failureRedirect: '/login',
            successReturnToOrRedirect: '/',
        })(req, res, (err) => {
            if (err) {
                console.error('Error during Google login: ', err)
                return res.status(500).send('Error during Google login')
            }
            console.log('Logged in with Google successfully')
        })
    },

    appleLogin: async (req, res) => {
        return passport.authenticate('apple')(req, res, (err) => {
            if (err) {
                console.error('Error during Apple login: ', err)
                return res.status(500).send('Error during Apple login')
            }
            //console.log('Handed off to Apple for login successfully')
        })
    },

    appleLoginVerify: async (req, res) => {
        console.log('Post Apple callback...')
        passport.authenticate('apple', {
            failureRedirect: '/login',
            successReturnToOrRedirect: '/',
        })(req, res, (err) => {
            if (err) {
                console.error('Apple Auth Error: ', err, ' stack: ', err.stack)
                if (err == 'AuthorizationError') {
                    res.send(
                        'Oops! Looks like you didn\'t allow the app to proceed. Please sign in again! <br /> \
                        <a href="/auth/apple/login">Sign in with Apple</a>'
                    )
                } else if (err == 'TokenError') {
                    res.send(
                        'Oops! Couldn\'t get a valid token from Apple\'s servers! <br /> \
                        <a href="/auth/apple/login">Sign in with Apple</a>'
                    )
                } else {
                    res.send(err)
                }
                console.log('Logged in with Apple successfully')
                //res.redirect('/user/profile')
            }
        })
    },
}

export default authController
