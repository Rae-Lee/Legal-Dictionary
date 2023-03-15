const passport = require('passport')
const { getUser } = require('../helpers/auth-helpers')
const authenticate = {
  authenticated: (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err || !user) {
        return res.json({
          status: 401,
          message: '請重新登入！'
        })
      }
      next()
    })
  },
  authenticatedPermission: (req, res, next) => {
    const id = req.params.id
    if (getUser(req).id !== id) {
      return res.json({
        status: 403,
        message: '沒有瀏覽的權限！'
      })
    }
    next()
  }
}
module.exports = authenticate
