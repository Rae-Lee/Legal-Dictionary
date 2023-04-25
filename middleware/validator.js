const bcrypt = require('bcryptjs')
const db = require('../models')
const { Element, Note, User } = db
const { getUser } = require('../helpers/auth-helpers')
const validator = {
  // 查找該關鍵字是否在資料庫
  validatedKeyword: async (req, res, next) => {
    try {
      const id = Number(req.params.id)
      const element = await Element.findByPk(id)
      if (!element) {
        return res.json({
          status: 404,
          message: '找不到相關的內容，請試試其他關鍵字!'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  // 查找該筆記是否在資料庫
  validatedNote: async (req, res, next) => {
    try {
      const id = Number(req.url.substring(1, req.url.length))
      const note = await Note.findByPk(id)
      if (!note) {
        return res.json({
          status: 404,
          message: '該筆記已不存在!'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  // 確認用戶註冊資料正確性
  validatedRegister: async (req, res, next) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      if (!account || !name || !email || !password || !checkPassword) {
        message.push('所有欄位皆為必填！')
      } else {
        if (password.trim() !== checkPassword.trim()) {
          message.push('密碼與確認密碼不相符!')
        }
        if (name.trim().length >= 50) {
          message.push('暱稱字數超出上限！')
        }
        if (!email.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/)) {
          message.push('email 輸入錯誤!')
        }
        const userFindByEmail = await User.findOne({ where: { email: email.trim() } })
        if (userFindByEmail) {
          message.push('email 已重複註冊!')
        }
        const userFindByAccount = await User.findOne({ where: { account: account.trim() } })
        if (userFindByAccount) {
          message.push('帳號已重複註冊!')
        }
      }
      if (message.length) {
        return res.json({
          status: 400,
          message
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  validatedLogin: async (req, res, next) => {
    try {
      const { account, password } = req.body
      if (!account || !password) {
        return res.json({
          status: 400,
          message: ['所有欄位皆為必填！']
        })
      }
      const user = await User.findOne({ where: { account: account.trim(), role: 'user' } })
      if (!user) {
        return res.json({
          status: 401,
          message: '帳號尚未註冊！'
        })
      }
      if (!bcrypt.compareSync(password.trim(), user.password)) {
        return res.json({
          status: 401,
          message: '帳號或密碼錯誤！'
        })
      }
      if (user.deletedAt) {
        return res.json({
          status: 403,
          message: '您的帳號已被列入黑名單中，請聯絡客服人員提供協助！'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  validatedAdminLogin: async (req, res, next) => {
    try {
      const { account, password } = req.body
      if (!account || !password) {
        return res.json({
          status: 400,
          message: ['所有欄位皆為必填！']
        })
      }
      const user = await User.findOne({ where: { account: account.trim(), role: 'admin' } })
      if (!user) {
        return res.json({
          status: 403,
          message: '無法登入！'
        })
      }
      if (!bcrypt.compareSync(password.trim(), user.password)) {
        return res.json({
          status: 401,
          message: '帳號或密碼錯誤！'
        })
      }
      if (user.deletedAt) {
        return res.json({
          status: 403,
          message: '您的帳號已被列入黑名單中，請聯絡客服人員提供協助！'
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  },
  validateEditSetting: async (req, res, next) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      if (!account || !name || !email || !password || !checkPassword) {
        message.push('所有欄位皆為必填！')
      } else {
        if (password.trim() !== checkPassword.trim()) {
          message.push('密碼與確認密碼不相符!')
        }
        if (name.trim().length >= 50) {
          message.push('暱稱字數超出上限！')
        }
        if (!email.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/)) {
          message.push('email 輸入錯誤!')
        }
        const userFindByEmail = await User.findOne({ where: { email: email.trim() } })
        if (userFindByEmail.id !== getUser(req).id) {
          message.push('email 已重複註冊!')
        }
        const userFindByAccount = await User.findOne({ where: { account: account.trim() } })
        if (userFindByAccount.id !== getUser(req).id) {
          message.push('帳號已重複註冊!')
        }
      }
      if (message.length) {
        return res.json({
          status: 400,
          message
        })
      }
      next()
    } catch (err) {
      throw new Error(err)
    }
  }
}
module.exports = validator
