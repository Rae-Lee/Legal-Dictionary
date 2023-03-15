const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../models')
const { User } = db

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
}, async (jwtPayload, done) => {
  try {
    const user = await User.findByPk(jwtPayload.id)
    if (!user) { return done(null, false) }
    return done(null, user)
  } catch (err) {
    return done(err, false)
  }
}))

module.exports = passport
