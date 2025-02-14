import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as AppleStrategy } from 'passport-apple'
import { Strategy as MagicLinkStrategy } from 'passport-magic-link'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import emailer from './emailer.js'
import generator from 'generate-password';
import userController from '../controllers/userController.js'

function passportConfig(passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      if (!user) {
        console.error("Session for user that does not exist: " + id);
        return done(null, false)
      }
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
          const user = await User.findOne({eq: { email }})
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
        const link = 'http://localhost:3000/auth/login/email/verify?token=' + token;
        const msg = {
          to: user.email,
          from: process.env.EMAIL_LOGIN_FROM_ADDRESS,
          subject: 'Login with Link',
          text: 'Hello! Click the link below to finish signing in.\r\n\r\n' + link,
          html: '<h3>Hello!</h3><p>Click the link below to finish signing in.</p><p><a href="' + link + '">Sign in</a></p>',
        };
        return emailer.sendMail(msg);
      },
      async (user) => {
        var dbuser = await User.findByEmail(user.email)
        if (!dbuser) {
          const newDefaultPassword=generator.generate({ length: 20, numbers: true, symbols: true, lowercase: true, uppercase: true });
          dbuser = await User.create({ email: user.email, password: newDefaultPassword, email_verified: true })
        } else if (!dbuser.email_verified) {
          dbuser.email_verified = true
          await User.save(dbuser);
        }
        return dbuser;
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
    const user = await User.findOne({eq: { email: profile.emails[0].value }});
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
    const user = await User.findOne({eq: { email: profile.emails[0].value }});
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
    const user = await User.findOne({eq: { email: profile.email }});
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
