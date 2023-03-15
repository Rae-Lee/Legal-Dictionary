const db = require('../models')
const { Element } = db
const validator = {
  validatedKeyword: async (req, res, next) => {
    const id = req.params.id
    const element = await Element.findByPk(id)
    if (!element) {
      return res.json({
        status: 404,
        message: '找不到相關的內容，請試試其他關鍵字!'
      })
    }
    next()
  }
}
module.exports = validator
