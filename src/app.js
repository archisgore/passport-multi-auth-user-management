import express from 'express'
import session from 'express-session'
import passport from 'passport'
import bodyParser from 'body-parser'
import pool from './config/database.js'
import passportConfig from './config/passport.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import 'dotenv/config.js'
import authMiddleware from './middleware/authMiddleware.js'
import connectPgSimple from 'connect-pg-simple'

const pgSession = connectPgSimple(session)

const app = express()
const PORT = process.env.PORT || 3000

// Connect to the database
app.locals.dbConnectionPool = pool

// Passport configuration
passportConfig(passport)

// Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // why the weird bool parsing: https://github.com/motdotla/dotenv/issues/51
            secure:
                process.env.SECURE_SESSION_COOKIE.toLocaleLowerCase().trim() !==
                'false', // Use secure cookies in production
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day in milliseconds
        },
        store: new pgSession({
            pool: app.locals.dbConnectionPool, // Connection pool
        }),
    })
)
app.use(passport.initialize())
app.use(passport.session())

// Set view engine
app.set('view engine', 'ejs')
app.set('views', 'src/views')

// Routes
app.use('/auth', authRoutes)
app.use('/user', authMiddleware.isAuthenticated, userRoutes)

// Home route
app.get('/', (req, res) => {
    res.render('index')
})

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
