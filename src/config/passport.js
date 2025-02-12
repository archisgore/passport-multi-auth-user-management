import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as AppleStrategy } from 'passport-apple'
import { Strategy as MagicLinkStrategy } from 'passport-magic-link'
import User from '../models/user.js'
import bcrypt from 'bcrypt'

function passportConfig(passport) {
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id)
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
                    const user = await User.findOne({ email })
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

    passport.use(
        new MagicLinkStrategy(
            {
                secret: 'my-secret',
                userFields: ['email'],
                tokenField: 'token',
            },
            (user, token) => {
                return MailService.sendMail({
                    to: user.email,
                    token,
                })
            },
            (user) => {
                return User.findByEmail(user.email)
            }
        )
    )

    /*
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        return done(null, user);
      }
      const newUser = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        googleId: profile.id
      });
      done(null, newUser);
    } catch (error) {
      done(error);
    }
  }));
  
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        return done(null, user);
      }
      const newUser = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        facebookId: profile.id
      });
      done(null, newUser);
    } catch (error) {
      done(error);
    }
  }));
  
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKey: process.env.APPLE_PRIVATE_KEY,
    callbackURL: '/auth/apple/callback'
  }, async (accessToken, refreshToken, idToken, profile, done) => {
    try {
      const user = await User.findOne({ email: profile.email });
      if (user) {
        return done(null, user);
      }
      const newUser = await User.create({
        email: profile.email,
        name: profile.name,
        appleId: profile.id
      });
      done(null, newUser);
    } catch (error) {
      done(error);
    }
  }));
  */
}

export default passportConfig
