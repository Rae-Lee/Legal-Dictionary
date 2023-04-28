const passport = require('passport')
const { getUser } = require('../helpers/auth-helpers')
const db = require('../models')
const { Note, User } = db

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
      req.user = user.dataValues
      return next()
    })(req, res, next)
  },
  // 進入前台的權限
  authenticatedUser: async (req, res, next) => {
    const user = await User.findByPk(getUser(req).id)
    if (getUser(req).deletedAt || user.deletedAt) {
      return res.json({
        status: 403,
        message: '您的帳號已被列入黑名單中，請聯絡客服人員提供協助！'
      })
    }
    if (!getUser(req)) {
      return res.json({
        status: 401,
        message: '請重新登入！'
      })
    }
    if (getUser(req).role !== 'user') {
      return res.json({
        status: 403,
        message: '沒有瀏覽及編輯的權限'
      })
    }
    next()
  },
  // 進入後台的權限
  authenticatedAdmin: async (req, res, next) => {
    const user = await User.findByPk(getUser(req).id)
    if (getUser(req).deletedAt || user.deletedAt) {
      return res.json({
        status: 403,
        message: '您的帳號已被列入黑名單中，請聯絡客服人員提供協助！'
      })
    }
    if (!getUser(req)) {
      return res.json({
        status: 401,
        message: '請重新登入！'
      })
    }
    if (getUser(req).role !== 'admin') {
      return res.json({
        status: 403,
        message: '沒有瀏覽及編輯的權限'
      })
    }
    next()
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
      const id = Number(req.url.substring(1, req.url.length))
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

module.exports = authenticate
