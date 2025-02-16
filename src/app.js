import express from 'express'
import session from 'express-session'
import passport from 'passport'
import bodyParser from 'body-parser'
import { default as pool, initDatabaseSchema } from './config/database.js'
import passportConfig from './config/passport.js'
import authRoutes from './routes/authRoutes.js'
import userRoutes from './routes/userRoutes.js'
import 'dotenv/config.js'
import authMiddleware from './middleware/authMiddleware.js'
import connectPgSimple from 'connect-pg-simple'

import fs from 'fs'
import http from 'http'
import https from 'https'

const pgSession = connectPgSimple(session)

const app = express()
const PORT = process.env.PORT || 3000

// Connect to the database
app.locals.dbConnectionPool = pool

// Initialize the database schema if init file is provided
if (process.env.INIT_DATABASE_SCHEMA_FILE) {
    // Wait until db is inited before proceeding
    initDatabaseSchema(process.env.INIT_DATABASE_SCHEMA_FILE)
}

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
            createTableIfMissing: true, // Automatically create session table if not exists
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

// Serve
const httpServer = http.createServer(app)
httpServer.listen(PORT, () => {
    console.log(`HTTP Server is running on http://localhost:${PORT}`)
})

if (process.env.HTTPS_ENABLE === 'true') {
    console.log('Https endpoint requested...')
    const HTTPS_PORT = process.env.HTTPS_PORT || 3443
    const privateKey = fs.readFileSync(
        process.env.HTTPS_PRIVATE_KEY_PATH,
        'utf8'
    )
    const certificate = fs.readFileSync(process.env.HTTPS_CERT_PATH, 'utf8')
    const credentials = {
        key: privateKey,
        cert: certificate,
        passphrase: process.env.HTTPS_PASSPHRASE,
    }
    const httpsServer = https.createServer(credentials, app)
    httpsServer.listen(HTTPS_PORT, () => {
        console.log(
            `HTTPS Server is running on https://localhost:${HTTPS_PORT}`
        )
    })
}
