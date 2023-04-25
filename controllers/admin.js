const { User, sequelize } = require('../models')
const jwt = require('jsonwebtoken')
const adminController = {
  login: async (req, res, next) => {
    try {
      const { account } = req.body
      const user = await User.findOne({ where: { account: account.trim(), role: 'admin' } })
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
  getUsers: async (req, res, next) => {
    try {
      const users = await sequelize.query('SELECT `Users`.`id`,`Users`.`account`,`Users`.`email`,`Users`.`deleted_at` AS `deletedAt`,COALESCE(`notes`.`noteCounts`, 0)AS `noteCounts`,COALESCE(`favorites`.`favoriteCounts`, 0)AS `favoriteCounts`FROM `Users`LEFT JOIN(SELECT `user_id`,COUNT(`id`) AS `noteCounts`FROM `Notes` GROUP BY `user_id`) AS `notes`ON `Users`.`id` = `notes`.`user_id` LEFT JOIN(SELECT `user_id`,COUNT(`id`)  AS `favoriteCounts`FROM `Favorites`GROUP BY `user_id` )AS`favorites`ON `Users`.`id` = `favorites`.`user_id` WHERE `Users`.`role` = "user"ORDER BY `noteCounts` DESC;', {
        raw: true,
        nest: true
      })
      return res.json({
        status: 200,
        data: { users }
      })
    } catch (err) {
      next(err)
    }
  },
  suspendUser: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id, {
        raw: true,
        nest: true
      })
      if (!user) {
        return res.json({
          status: 404,
          message: '找不到用戶!'
        })
      }
      if (user.role === 'admin') {
        return res.json({
          status: 403,
          message: '不得暫停管理員帳號！'
        })
      }
      if (user.deletedAt) {
        return res.json({
          status: 403,
          message: '此用戶已停權！'
        })
      }
      const date = new Date()
      await sequelize.query('UPDATE `Users` SET `deleted_at` = $date WHERE `id` = $id;', {
        type: sequelize.QueryTypes.UPDATE,
        bind: { date, id },
        raw: true,
        nest: true
      })

      return res.json({
        status: 200,
        message: '已成功暫停此用戶！',
        data: {
          ...user,
          deletedAt: date
        }
      })
    } catch (err) {
      next(err)
    }
  },
  unsuspendUser: async (req, res, next) => {
    try {
      const id = req.params.id
      const user = await User.findByPk(id, {
        raw: true,
        nest: true
      })
      if (!user) {
        return res.json({
          status: 404,
          message: '找不到用戶!'
        })
      }
      if (user.role === 'admin') {
        return res.json({
          status: 403,
          message: '不得解除管理員帳號停權狀態！'
        })
      }
      if (user.deletedAt === null) {
        return res.json({
          status: 403,
          message: '此用戶未遭停權！'
        })
      }
      await sequelize.query('UPDATE `Users` SET `deleted_at` = null WHERE `id` = $id;', {
        type: sequelize.QueryTypes.UPDATE,
        bind: { id },
        raw: true,
        nest: true
      })
      return res.json({
        status: 200,
        message: '已成功解除此用戶停權狀態！',
        data: {
          ...user,
          deletedAt: null
        }
      })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = adminController
