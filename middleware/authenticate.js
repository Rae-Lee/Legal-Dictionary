const passport = require('passport')
const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { Note } = db
const authenticate = {
  // 身分token驗證
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
  // 瀏覽或編輯個人檔案的權限
  authenticatedProfile: (req, res, next) => {
    const id = req.params.id
    if (getUser(req).id !== id) {
      return res.json({
        status: 403,
        message: '沒有瀏覽的權限！'
      })
    }
    next()
  },
  // 編輯筆記的權限
  authenticatedNote: async (req, res, next) => {
    const id = req.params.id
    const note = await Note.findByPk(id)
    if (getUser(req).id !== note.userId) {
      return res.json({
        status: 403,
        message: '沒有編輯的權限！'
      })
    }
    next()
  }
}
module.exports = authenticate
