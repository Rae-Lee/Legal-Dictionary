const db = require('../models')
const { Reference, Field } = db
const referencesController = {
  getReference: async (req, res, next) => {
    try {
      const id = req.params.id
      const reference = await Reference.findByPk(id, {
        include: Field,
        nest: true,
        raw: true
      })
      if (!reference) {
        res.json({
          status: 404,
          message: '本段落尚未有完整裁判書內容!'
        })
      } else {
        res.json({
          status: 200,
          data: reference
        })
      }
    } catch (err) {
      next(err)
    }
  }
}

module.exports = referencesController
