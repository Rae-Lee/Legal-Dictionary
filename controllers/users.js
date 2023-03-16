const db = require('../models')
const { User, Like, Element, Note } = db
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUser } = require('../helpers/auth-helpers')

const usersController = {
  register: async (req, res, next) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      if (!account || !name || !email || !password) {
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
        if (!userFindByEmail) {
          message.push('email 已重複註冊!')
        }
        const userFindByAccount = await User.findOne({ where: { account: account.trim() } })
        if (!userFindByAccount) {
          message.push('帳號已重複註冊!')
        }
      }
      if (message.length) {
        res.json({
          status: 400,
          message
        })
      } else {
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(password.trim(), salt)
        const user = await User.create({
          account: account.trim(),
          name: name.trim(),
          email: email.trim(),
          password: passwordHashed
        })
        res.json({
          status: 200,
          message: '帳號已成功註冊',
          data: user.toJSON()
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  login: async (req, res, next) => {
    try {
      // 驗證
      const { account, password } = req.body
      const user = await User.findOne({ where: { account } })
      if (!user) {
        res.json({
          status: 400,
          message: ['此帳號不存在！']
        })
      } else if (!bcrypt.compareSync(password, user.password)) {
        res.json({
          status: 400,
          message: ['帳號或密碼錯誤！']
        })
      } else {
        // 驗證過後就簽發token
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET_KEY, { expiresIn: '30d' })
        delete user.password // 不回傳密碼
        res.json({
          status: 200,
          message: '登入成功!',
          data: {
            token,
            user: user.toJSON()
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const likes = await Like.findAll({
        where: { userId: getUser(req).id },
        include: Element,
        order: ['createdAt', 'DESC'],
        raw: true
      })
      if (!likes.length) {
        res.json({
          status: 404,
          message: '尚未有收藏的關鍵字!'
        })
      } else {
        res.json({
          status: 200,
          data: { likes }
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getNotes: async (req, res, next) => {
    try {
      const notes = await Note.findAll({
        where: { userId: getUser(req).id },
        include: Element,
        order: ['createdAt', 'DESC'],
        raw: true
      })
      if (!notes.length) {
        res.json({
          status: 404,
          message: '尚未有任何筆記!'
        })
      } else {
        res.json({
          status: 200,
          data: { notes }
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(getUser(req).id)
      if (!user) {
        res.json({
          status: 404,
          message: '使用者不存在，請重新註冊！'
        })
      } else {
        delete user.password
        res.json({
          status: 200,
          data: user.toJSON()
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  editProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(getUser(req).id, {
        raw: true,
        nest: true
      })
      if (!user) {
        res.json({
          status: 404,
          message: '使用者不存在，請重新註冊！'
        })
      } else {
        const { account, name, email, password, checkPassword } = req.body
        const message = []
        if (!account || !name || !email || !password) {
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
          res.json({
            status: 400,
            message
          })
        } else {
          const salt = await bcrypt.genSalt(10)
          const passwordHashed = await bcrypt.hash(password.trim(), salt)
          const result = await user.update({
            account: account.trim(),
            name: name.trim(),
            email: email.trim(),
            password: passwordHashed
          })
          res.json({
            status: 200,
            message: '檔案已更改成功！',
            data: result.toJSON()
          })
        }
      }
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = usersController
