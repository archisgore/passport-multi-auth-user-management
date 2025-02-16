import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as AppleStrategy } from 'passport-apple'
import { Strategy as MagicLinkStrategy } from 'passport-magic-link'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import emailer from './emailer.js'
import generateNewPassword from '../lib/newPasswordGenerator.js'
import fs from 'fs'
import jwt from 'jsonwebtoken'

function passportConfig(passport) {
    passport.serializeUser((user, done) => {
        //console.log("Serializing user: ", user, " user.id: ", user.id);
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
            if (!user) {
                console.error('Session for user that does not exist: ' + id)
                return done(null, false)
            }
            //console.log("Deserialized user by id: ", id, " User: ", user);
            done(null, user)
        } catch (error) {
            done(error)
        }
    })

    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
            },
            async (email, password, done) => {
                try {
                    const user = await User.findOne({ eq: { email } })
                    if (!user) {
                        return done(null, false, {
                            message: 'Incorrect email.',
                        })
                    }
                    const isMatch = await bcrypt.compare(
                        password,
                        user.password
                    )
                    if (!isMatch) {
                        return done(null, false, {
                            message: 'Incorrect password.',
                        })
                    }
                    return done(null, user)
                } catch (error) {
                    return done(error)
                }
            }
        )
    )

    // Magic Link Strategy
    passport.use(
        new MagicLinkStrategy(
            {
                secret: process.env.MAGIC_LINK_SECRET,
                userFields: ['email'],
                tokenField: 'token',
                verifyUserAfterToken: true,
            },
            (user, token) => {
                const link =
                    'http://localhost:3000/auth/login/email/verify?token=' +
                    token
                const msg = {
                    to: user.email,
                    from: process.env.EMAIL_LOGIN_FROM_ADDRESS,
                    subject: 'Login with Link',
                    text:
                        'Hello! Click the link below to finish signing in.\r\n\r\n' +
                        link,
                    html:
                        '<h3>Hello!</h3><p>Click the link below to finish signing in.</p><p><a href="' +
                        link +
                        '">Sign in</a></p>',
                }
                return emailer.sendMail(msg)
            },
            async (user) => {
                var dbuser = await User.findByEmail(user.email)
                if (!dbuser) {
                    dbuser = await User.create({
                        email: user.email,
                        password: generateNewPassword(),
                        email_verified: true,
                    })
                } else if (!dbuser.email_verified) {
                    dbuser.email_verified = true
                    await User.save(dbuser)
                }
                return dbuser
            }
        )
    )

    if (process.env.GOOGLE_LOGIN === 'true') {
        console.error('Google login is enabled')
        passport.use(
            new GoogleStrategy(
                {
                    clientID: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    callbackURL: '/auth/google/callback',
                },
                async (_accessToken, _refreshToken, profile, done) => {
                    //console.log("Google Login profile: ", profile);
                    try {
                        // look for user with google id
                        var user = await User.findOne({
                            eq: { google_id: profile.id },
                        })
                        // if not look for user with the same email
                        if (!user) {
                            user = await User.findOne({
                                eq: { email: profile.emails[0].value },
                            })
                        }
                        // if not, create a user with the same email
                        if (!user) {
                            user = await User.create({
                                email: profile.emails[0].value,
                                password: generateNewPassword(),
                                email_verified: profile.emails[0].verified,
                            })
                        }

                        if (!user.email_verified || !user.google_id) {
                            user.email_verified = profile.emails[0].verified
                            user.google_id = profile.id
                            await User.save(user)
                        }
                        done(null, user)
                    } catch (error) {
                        console.log(
                            'Error when Google Login: ',
                            error,
                            error.stack
                        )
                        done(error)
                    }
                }
            )
        )
    }

    if (process.env.FACEBOOK_LOGIN === 'true') {
        console.error('Facebook login is not supported yet')
        throw new Error('Facebook login is not supported yet')
        passport.use(
            new FacebookStrategy(
                {
                    clientID: process.env.FACEBOOK_APP_ID,
                    clientSecret: process.env.FACEBOOK_APP_SECRET,
                    callbackURL: '/auth/facebook/callback',
                    profileFields: ['id', 'displayName', 'emails'],
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        const user = await User.findOne({
                            eq: { email: profile.emails[0].value },
                        })
                        if (user) {
                            return done(null, user)
                        }
                        const newUser = await User.create({
                            email: profile.emails[0].value,
                            name: profile.displayName,
                            facebookId: profile.id,
                        })
                        done(null, newUser)
                    } catch (error) {
                        done(error)
                    }
                }
            )
        )
    }

    if (process.env.APPLE_LOGIN === 'true') {
        console.log('Apple login is enabled')

        if (!fs.existsSync(process.env.APPLE_PRIVATE_KEY_PATH)) {
            throw new Error(
                'Apple private key file not found at: ' +
                    process.env.APPLE_PRIVATE_KEY_PATH +
                    '. Apple Login will silently fail.'
            )
        }
        passport.use(
            new AppleStrategy(
                {
                    clientID: process.env.APPLE_CLIENT_ID,
                    teamID: process.env.APPLE_TEAM_ID,
                    keyID: process.env.APPLE_KEY_ID,
                    privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH,
                    callbackURL: '/auth/apple/callback',
                },
                async (
                    _req,
                    _accessToken,
                    _refreshToken,
                    idToken,
                    _profile,
                    done
                ) => {
                    const decodedIdToken = jwt.decode(idToken)
                    //console.log("Verifying Apple Auth...", idToken, "profile: ", profile, " decoded _idToken: ", decodedIdToken);
                    try {
                        // Look for user with this apple id
                        var user = await User.findOne({
                            eq: { apple_id: decodedIdToken.sub },
                        })

                        if (!user) {
                            // if not, find a user with this email
                            user = await User.findOne({
                                eq: { email: decodedIdToken.email },
                            })
                        }

                        // if not, create a new user
                        if (!user) {
                            user = await User.create({
                                email: decodedIdToken.email,
                                password: generateNewPassword(),
                                email_verified: decodedIdToken.email_verified,
                            })
                        }

                        if (!user.email_verified || !user.apple_id) {
                            user.email_verified = decodedIdToken.email_verified
                            user.apple_id = decodedIdToken.sub
                            await User.save(user)
                        }

                        //console.log("Apple User logged in: ", user);
                        done(null, user)
                    } catch (error) {
                        console.log(
                            'Error when Apple Login: ',
                            error,
                            error.stack
                        )
                        done(error)
                    }
                }
            )
        )
    }
}

export default passportConfig
