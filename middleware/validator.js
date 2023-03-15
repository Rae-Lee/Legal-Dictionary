const db = require('../models')
const { Element, Note } = db
const validator = {
  // 查找該關鍵字
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
    // 查找該筆記
    validatedNote: async (req, res, next) => {
      const id = req.params.id
      const note = await Note.findByPk(id)
      if (!note) {
        return res.json({
          status: 404,
          message: '該筆記已不存在!'
        })
      }
      next()
    }
}
module.exports = validator
