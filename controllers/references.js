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
      res.json({
        status: 200,
        data: reference
      })
    } catch (err) {
      console.log(err)
    }
  }
}

module.exports = referencesController
