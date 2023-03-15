const db = require('../models')
const { Element, Favorite } = db
const { getUser } = require('../helpers/auth-helpers')
const likesController = {
  addLike: async (req, res, next) => {
    try {
      const id = req.params.id
      const keyword = await Element.findByPk(id)
      const like = await Favorite.create({
        userId: getUser.id,
        elementId: keyword.id
      })
      res.json({
        status: 200,
        data: like.toJSON()
      })
    } catch (err) {
      console.log(err)
    }
  },
  deleteLike: async (req, res, next) => {
    try {
      const id = req.params.id
      const keyword = await Element.findByPk(id)
      const like = await Favorite.findOne({
        where: { elementId: keyword.id },
        raw: true,
        nest: true
      })
      const unlike = await like.destroy()
      res.json({
        status: 200,
        data: unlike
      })
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = likesController
