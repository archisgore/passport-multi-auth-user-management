import User from '../models/user.js'
import bcrypt from 'bcrypt'

const userController = {
  viewProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
      if (!user) {
        return res.status(404).send('User not found')
      }
      res.render('profile', { user })
    } catch (error) {
      res.status(500).send('Server error')
    }
  },

  // Delete user profile
  deleteProfile: async (req, res) => {
    const userId = req.user.id
    try {
      await User.delete(userId)
      return userController.logout(req, res);
    } catch (error) {
      console.error(`Error deleting profile: ${error}, ${error.stack}`)
      res.status(400).send('Error deleting profile')
    }
  },

  // Render change password page
  renderChangePassword: (req, res) => {
    res.render('changePassword', { user: req.user })
  },

  // Change password
  changePassword: async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body
    try {
      // check if current password is matches the one in the db
      const isMatch = await bcrypt.compare(currentPassword, req.user.password)
      if (!isMatch) {
        return res.status(400).send('Current password is incorrect')
      }

      if (newPassword !== confirmPassword)
        return res.status(400).send('New Passwords do not match')

      // Check if the new password is the same as the old password
      const isSamePassword = await bcrypt.compare(newPassword, req.user.password)
      if (isSamePassword) {
        return res.status(400).send('New password cannot be the same as the old password')
      }

      // Hash the new password and save it
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const dbuser = req.user;
      dbuser.password = hashedPassword
      await User.save(dbuser)

      res.send('Password changed successfully')
    } catch (error) {
      console.error(`Error changing password: ${error}, ${error.stack}`)
      res.status(400).send('Error changing password')
    }
  },

  renderVerifyEmail: (req, res) => {
    res.render('verifyEmail', { user: req.user })
  },

  // Logout user
  logout: (req, res) => {
    req.logout((err) => {
      if (err) { return next(err); }
      req.session.destroy((err) => {
        if (err) { return next(err); }
        res.redirect('/');
      })
    })
  }
}

export default userController
