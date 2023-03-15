const db = require('../models')
const { User } = db
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const usersController = {
  register: async (req, res, next) => {
    try {
      const { account, name, email, password, checkPassword } = req.body
      const message = []
      if (!account || !name || !email || !password) {
        message.push('所有欄位皆為必填！')
      } else {
        if (password !== checkPassword) {
          message.push('密碼與確認密碼不相符!')
        }
        if (name.length >= 50) {
          message.push('暱稱字數超出上限！')
        }
        if (!email.match(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/)) {
          message.push('email 輸入錯誤!')
        }
        const userFindByEmail = await User.findOne({ where: { email } })
        if (!userFindByEmail) {
          message.push('email 已重複註冊!')
        }
        const userFindByAccount = await User.findOne({ where: { account } })
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
        const passwordHashed = await bcrypt.hash(password, salt)
        const user = await User.create({
          account,
          name,
          email,
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
  }
}
module.exports = usersController
