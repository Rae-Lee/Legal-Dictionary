const db = require('../models')
const { Favorite, sequelize } = db
const { getUser } = require('../helpers/auth-helpers')
const likesController = {
  addLike: async (req, res, next) => {
    try {
      const id = req.params.id
      const userId = getUser(req).id
      const like = await Favorite.findOne({
        where: { elementId: id, userId },
        raw: true,
        nest: true
      })
      if (like) {
        return res.json({
          status: 403,
          message: '此關鍵字已加入最愛！'
        })
      }
      const addLike = await Favorite.create({
        userId,
        elementId: id
      })
      return res.json({
        status: 200,
        data: addLike.toJSON()
      })
    } catch (err) {
      next(err)
    }
  },
  deleteLike: async (req, res, next) => {
    try {
      const id = req.params.id
      const userId = getUser(req).id
      const like = await Favorite.findOne({
        where: { elementId: id, userId },
        raw: true,
        nest: true
      })
      if (!like) {
        return res.json({
          status: 403,
          message: '此關鍵字未加入最愛！'
        })
      }
      await sequelize.query('DELETE FROM `Favorites` WHERE `element_id` = $id AND `user_id` = $userId', {
        type: sequelize.QueryTypes.DELETE,
        bind: { id, userId },
        raw: true,
        nest: true
      })
      return res.json({
        status: 200,
        data: like
      })
    } catch (err) {
      next(err)
    }
  }
}
module.exports = likesController
