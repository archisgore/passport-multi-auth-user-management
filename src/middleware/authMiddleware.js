const authMiddleware = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/auth/login')
  },

  isEmailVerified: (req, res, next) => {
    if (req.user && req.user.emailVerified) {
      return next()
    }
    res.redirect('/user/verify-email')
  },

  isNotAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next()
    }
    res.redirect('/user/profile')
  }
}

export default authMiddleware
