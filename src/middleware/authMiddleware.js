const authMiddleware = {
  isAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return authMiddleware.isEmailVerified(req, res, next)
    }
    res.redirect('/auth/login')
  },

  isEmailVerified: (req, res, next) => {
      // If user is authenticated and either email is verified or the current path is to verify email, continue
    if (req.user && (req.user.email_verified || req.path.endsWith('/verify-email'))) {
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
