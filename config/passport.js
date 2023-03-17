const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../models')
const { User } = db

const jwtOpts = {}
jwtOpts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOpts.secretOrKey = process.env.JWT_SECRET_KEY
jwtOpts.passReqToCallback = true
passport.use(new JwtStrategy(jwtOpts, async (req, payload, done) => {
  try {
    const user = await User.findByPk(payload.id)
    if (!user) return done(null, false)
    req.user = user
    return done(null, user)
  } catch (err) {
    return done(err, false)
  }
}))

module.exports = passport
