const db = require('../models')
const { Element, Search, Note, sequelize } = db
const dayjs = require('dayjs')
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
          message: '找不到相關裁判書!'
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
          message: '找不到相關條文!'
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
  getNotes: async (req, res, next) => {
    try {
      const id = req.params.id
      const notes = await Note.findAll({
        where: { elementId: id },
        order: ['createdAt', 'DESC'],
        raw: true
      })
      if (!notes.length) {
        res.json({
          status: 404,
          message: '尚未有筆記，請新增!'
        })
      } else {
        const results = notes.map((note) => {
          return {
            ...note,
            relativeTime: dayjs(note.createdAt)
          }
        })
        res.json({
          status: 200,
          data: { notes: results }
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
  },
  addKeyword: async (req, res, next) => {
    try {
      const { name } = req.body
      if (!name) {
        res.json({
          status: 400,
          message: ['搜尋欄不可空白！']
        })
      } else {
        // 尋找資料庫中是否已經有此關鍵字
        let keyword = await Element.findOne({ where: { name: name.trim() } })
        // 若沒有就新增一個
        if (!keyword) {
          keyword = await Element.create({ name: name.trim() })
        }
        // 儲存搜尋紀錄
        await Search.create({ elementId: keyword.id })
        res.json({
          status: 200,
          data: keyword.toJSON()
        })
      }
    } catch (err) {
      console.log(err)
    }
  }
}
module.exports = keywordsController
