const db = require('../models')
const { Element, sequelize } = db
const keywordsController = {
  getKeyword: async (req, res, next) => {
    try {
      const id = req.params.id
      const keyword = await Element.findByPk(id, {
        raw: true
      })
      if (!keyword) {
        res.json({
          status: 404,
          message: '沒有相關的內容，請試試其他關鍵字!'
        })
      } else {
        res.json({
          status: 200,
          data: keyword
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getReferences: async (req, res, next) => {
    try {
      const id = req.params.id
      const element = await Element.findByPk(id)
      const references = await sequelize.query(
        'SELECT `References`.*,`Fields`.`name` AS `Field.name`,COUNT(`Quotes`.`reference_id`) AS `count` FROM `Paragraphs` JOIN `Quotes` ON `Paragraphs`.`id` = `Quotes`.`paragraph_id` JOIN `References` ON `Quotes`.`reference_id` = `References`.`id` JOIN `Fields` ON `Fields`.`id` = `References`.`field_id` WHERE `Paragraphs`.`content` LIKE $keyword GROUP BY `Quotes`.`reference_id` ORDER BY `count` DESC;', {
          bind: { keyword: `%${element.name}%` },
          raw: true,
          nest: true
        }
      )
      if (!references.length) {
        res.json({
          status: 404,
          message: '沒有相關裁判書!'
        })
      } else {
        res.json({
          status: 200,
          data: { references }
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getArticles: async (req, res, next) => {
    try {
      const id = req.params.id
      const element = await Element.findByPk(id)
      const articles = await sequelize.query(
        'SELECT `Articles`.*,`Codes`.`name` AS `Code.name`,`Codes`.`is_abandon` AS `Code.isAbandon`,COUNT(`Paragraph_articles`.`article_id`) AS `count` FROM `Paragraphs` JOIN `Paragraph_articles` ON `Paragraphs`.`id` = `Paragraph_articles`.`paragraph_id` JOIN `Articles` ON `Paragraph_articles`.`article_id` = `Articles`.`id` JOIN `Codes` ON `Codes`.`id` = `Articles`.`code_id` WHERE `Paragraphs`.`content` LIKE $keyword GROUP BY `Paragraph_articles`.`article_id` ORDER BY `count` DESC;', {
          bind: { keyword: `%${element.name}%` },
          raw: true,
          nest: true
        }
      )
      if (!articles.length) {
        res.json({
          status: 404,
          message: '沒有相關條文!'
        })
      } else {
        res.json({
          status: 200,
          data: { articles }
        })
      }
    } catch (err) {
      console.log(err)
    }
  },
  getTopKeywords: async (req, res, next) => {
    try {
      const keywords = await sequelize.query(
        'SELECT `Elements`.*,COUNT(`Searches`.*) AS `count` FROM `Elements` JOIN `Searches` ON `Elements`. `id` = `Searches`.`element_id` GROUP BY `Searches`.`element_id` ORDER BY `count` DESC LIMIT 10;', {
          raw: true
        }
      )
      res.json({
        status: 200,
        data: { keywords }
      })
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = keywordsController
