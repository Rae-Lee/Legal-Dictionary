const passport = require('passport')
const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { Note } = db
// 身分token驗證
const authenticated = passport.authenticate('jwt', { session: false })
const authenticate = {
  // 進入前台的權限
  authenticatedUser: (req, res, next) => {
    if (getUser(req) && getUser(req).role === 'user') return next()
    return res.json({
      status: '403',
      message: '沒有瀏覽及編輯的權限'
    })
  },
  authenticatedAdmin: (req, res, next) => {
    if (getUser(req) && getUser(req).role === 'admin') return next()
    return res.json({
      status: '403',
      message: '沒有瀏覽及編輯的權限'
    })
  },
  // 進入後台的權限
  authenticatedProfile: (req, res, next) => {
    try {
      const id = Number(req.params.id)
      if (getUser(req).id !== id) {
        return res.json({
          status: 403,
          message: '沒有瀏覽的權限！'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  // 編輯筆記的權限
  authenticatedNote: async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const note = await Note.findByPk(id)
      if (getUser(req).id !== note.userId) {
        return res.json({
          status: 403,
          message: '沒有編輯的權限！'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  }
}

module.exports = { authenticate, authenticated }
