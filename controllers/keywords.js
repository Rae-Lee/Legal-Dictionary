const db = require('../models')
const { Element, Paragraph } = db
const { Op } = require('sequelize')
const keywordsController = {
  getKeyword: async (req, res, next) => {
    try {
      const id = req.params.id
      const keyword = await Element.findByPk(id, {
        raw: true
      })
      res.json({
        status: 200,
        data: keyword
      })
    } catch (err) {
      console.log(err)
    }
  },
  getReferences: async (req, res, next) => {
    try {
      const id = req.params.id
      const element = await Element.findByPk(id)
      const paragraphs = await Paragraph.findAll({
        where: {
          content: {
            [Op.regexp]: `${element.name}`
          }
        }
      })
      
    } catch (err) {
      console.log(err)
    }
  },
  getArticles: async (req, res, next) => {

  },
  getTopKeywords: async (req, res, next) => {

  }
}
module.exports = keywordsController
