import express from 'express';
import session from 'express-session';
import passport from 'passport';
import bodyParser from 'body-parser';
import path from 'path';
import pool from './config/database.js';
import passportConfig from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import viewRoutes from './routes/viewRoutes.js';
import "dotenv/config.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to the database
app.locals.dbConnectionPool = pool;

// Passport configuration
passportConfig(passport);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', 'src/views');

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.use('/', viewRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});