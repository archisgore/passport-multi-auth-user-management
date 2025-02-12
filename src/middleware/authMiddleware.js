const isAuthenticated = (req, res, next) => {
    console.log('isAuthenticated', req.isAuthenticated())
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/auth/login')
}

const isNotAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next()
    }
    res.redirect('/user/profile')
}

export default {
    isAuthenticated,
    isNotAuthenticated,
}
