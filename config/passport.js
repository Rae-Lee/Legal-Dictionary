const passport = require('passport')
const bcrypt = require('bcryptjs')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const db = require('../models')
const { User } = db
passport.use(new LocalStrategy({
  usernameField: 'account',
  passwordField: 'password'
}, async (account, password, done) => {
  try{
    const user = await User.findOne({ where: { account } })
    if (!user) { return done(null, false) }
    if (!bcrypt.compareSync(password, user.password)) { return done(null, false) }
    return done(null, user)
  } catch (err) {
    return done(err, false)
  }
}))
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY
}, async (jwtPayload, done) => {
  try {
    const user = await User.findByPk(jwtPayload.id)
  } catch (err) {
    return done(err, false)
  }
  User.findOne({ account: jwtPayload.account }, function (err, user) {
    if (err) {
      return done(err, false)
    }
    if (user) {
      return done(null, user)
    } else {
      return done(null, false)
      // or you could create a new account
    }
  })
}))

module.exports = passport
