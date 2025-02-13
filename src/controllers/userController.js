import User from '../models/user.js'
import bcrypt from 'bcrypt'

const userController = {}
userController.viewProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        if (!user) {
            return res.status(404).send('User not found')
        }
        res.render('profile', { user })
    } catch (error) {
        res.status(500).send('Server error')
    }
}

userController.deleteProfile = async (req, res) => {
    try {
        await User.deleteById(req.user.id)
        req.logout()
        res.redirect('/')
    } catch (error) {
        res.status(500).send('Server error')
    }
}

// Delete user profile
userController.deleteProfile = async (req, res) => {
    const userId = req.user.id
    try {
        await User.destroy({ where: { id: userId } })
        req.logout()
        res.send('Profile deleted successfully')
    } catch (error) {
        console.error(`Error deleting profile: ${error}, ${error.stack}`)
        res.status(400).send('Error deleting profile')
    }
}

// Render change password page
userController.renderChangePassword = (req, res) => {
    res.render('changePassword', { user: req.user })
}

// Change password
userController.changePassword = async (req, res) => {
    const { email, newPassword } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) return res.status(404).send('User not found')

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await User.save(user)

        res.send('Password changed successfully')
    } catch (error) {
        console.error(`Error changing password: ${error}, ${error.stack}`)
        res.status(400).send('Error changing password')
    }
}

userController.renderVerifyEmail = (req, res) => {
    res.render('verifyEmail', { user: req.user })
}

// Logout user
userController.logout = (req, res) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.redirect('/');
    })
}

export default userController
