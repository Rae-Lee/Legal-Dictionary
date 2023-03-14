const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
passport.use(new JwtStrategy())

module.exports = passport