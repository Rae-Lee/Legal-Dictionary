const passport = require('passport')
const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { Note, User } = db
// 身分token驗證
const authenticated = passport.authenticate('jwt', { session: false })
const authenticate = {
  // 進入前台的權限
  authenticatedUser: async (req, res, next) => {
    const user = await User.findByPk(getUser(req).id)
    if (getUser(req) && getUser(req).role === 'user' && !getUser(req).deletedAt && !user.deletedAt) return next()
    return res.json({
      status: '403',
      message: '沒有瀏覽及編輯的權限'
    })
  },
   // 進入後台的權限
  authenticatedAdmin: (req, res, next) => {
    const user = await User.findByPk(getUser(req).id)
    if (getUser(req) && getUser(req).role === 'admin' && !getUser(req).deletedAt && !user.deletedAt) return next()
    return res.json({
      status: '403',
      message: '沒有瀏覽及編輯的權限'
    })
  },
 // 瀏覽個人資訊的權限
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
