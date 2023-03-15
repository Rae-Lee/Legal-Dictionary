const passport = require('passport')
const authenticate = {
  authenticated: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) return res.json({ status: 401, message: '請重新登入！' })
      next()
    })
  },

}
module.exports = authenticate