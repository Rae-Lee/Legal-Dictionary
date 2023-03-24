const db = require('../models')
const { User, Like, Element, Note } = db
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getUser } = require('../helpers/auth-helpers')
const countTotalPage = require('../helpers/pagination-helpers')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const dataPerPage = 10 // 一頁出現10筆資料

const usersController = {
  register: async (req, res, next) => {
    try {
      const { account, name, email, password } = req.body
      const salt = await bcrypt.genSalt(10)
      const passwordHashed = await bcrypt.hash(password.trim(), salt)
      const user = await User.create({
        account: account.trim(),
        name: name.trim(),
        email: email.trim(),
        role: 'user',
        password: passwordHashed
      })
      const dataUser = user.toJSON()
      delete dataUser.password
      return res.json({
        status: 200,
        message: '帳號已成功註冊',
        data: dataUser
      })
    } catch (err) {
      next(err)
    }
  },
  login: async (req, res, next) => {
    try {
      // 驗證
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
      const dataUser = user.toJSON()
      delete dataUser.password // 不回傳密碼
      // 驗證過後就簽發token
      const token = jwt.sign(dataUser, process.env.JWT_SECRET_KEY, { expiresIn: '10d' })
      return res.json({
        status: 200,
        message: '登入成功!',
        data: {
          token,
          user: dataUser
        }
      })
    } catch (err) {
      next(err)
    }
  },
  getLikes: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1
      const dataOffset = (currentPage - 1) * 10
      const likes = await Like.findAndCountAll({
        where: { userId: getUser(req).id },
        include: Element,
        order: [['createdAt', 'DESC']],
        limit: dataPerPage,
        offset: dataOffset,
        raw: true
      })
      if (!likes.count) {
        return res.json({
          status: 404,
          message: '尚未有收藏的關鍵字!'
        })
      } else {
        return res.json({
          status: 200,
          data: { likes: likes.rows },
          pagination: { currentPage, totalPage: countTotalPage(likes.count) }
        })
      }
    } catch (err) {
      next(err)
    }
  },
  getNotes: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1
      const dataOffset = (currentPage - 1) * 10
      const notes = await Note.findAndCountAll({
        where: { userId: getUser(req).id },
        include: Element,
        order: [['createdAt', 'DESC']],
        limit: dataPerPage,
        offset: dataOffset,
        raw: true
      })
      if (!notes.count) {
        return res.json({
          status: 404,
          message: '尚未有任何筆記!'
        })
      } else {
        const results = notes.rows.map(note => {
          return {
            ...note,
            relativeTime: dayjs(note.createdAt).fromNow()
          }
        })
        return res.json({
          status: 200,
          data: { notes: results },
          pagination: { currentPage, totalPage: countTotalPage(notes.count) }
        })
      }
    } catch (err) {
      next(err)
    }
  },
  getProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(getUser(req).id)
      if (!user) {
        return res.json({
          status: 404,
          message: '使用者不存在，請重新註冊！'
        })
      } else {
        const dataUser = user.toJSON()
        delete dataUser.password
        return res.json({
          status: 200,
          data: dataUser
        })
      }
    } catch (err) {
      next(err)
    }
  },
  editProfile: async (req, res, next) => {
    try {
      const user = await User.findByPk(getUser(req).id, {
        raw: true,
        nest: true
      })
      if (!user) {
        return res.json({
          status: 404,
          message: '使用者不存在，請重新註冊！'
        })
      } else {
        const { account, name, email, password } = req.body
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(password.trim(), salt)
        const result = await user.update({
          account: account.trim(),
          name: name.trim(),
          email: email.trim(),
          password: passwordHashed
        })
        const dataUser = result.toJSON()
        delete dataUser.password
        return res.json({
          status: 200,
          message: '檔案已更改成功！',
          data: dataUser
        })
      }
    } catch (err) {
      next(err)
    }
  }
}
module.exports = usersController
