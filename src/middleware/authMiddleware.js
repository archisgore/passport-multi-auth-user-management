const authMiddleware = {
    isAuthenticated: (req, res, next) => {
        //console.log('req.isAuthenticated()', req.isAuthenticated(), " Req User:", req.user);
        if (req.isAuthenticated()) {
            return authMiddleware.isEmailVerified(req, res, next)
        }
        res.redirect('/auth/login')
    },

    isEmailVerified: (req, res, next) => {
        // If user is authenticated and either email is verified or the current path is to verify email, continue
        //console.log('req.user.email_verified', req.user.email_verified);
        if (
            req.user &&
            (req.user.email_verified || req.path.endsWith('/verify-email'))
        ) {
            return next()
        }
        res.redirect('/user/verify-email')
    },

    isNotAuthenticated: (req, res, next) => {
        if (!req.isAuthenticated()) {
            return next()
        }
        res.redirect('/user/profile')
    },
}

export default authMiddleware
