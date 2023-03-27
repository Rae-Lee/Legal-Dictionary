const db = require('../models')
const { Element, Search, Note, sequelize } = db
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)
const countTotalPage = require('../helpers/pagination-helpers')
const { getUser } = require('../helpers/auth-helpers')
const dataPerPage = 10 // 一頁出現10筆資料
const keywordsController = {
  getKeyword: async (req, res, next) => {
    try {
      const id = req.params.id
      const keyword = await Element.findByPk(id, {
        raw: true
      })
      return res.json({
        status: 200,
        data: keyword
      })
    } catch (err) {
      next(err)
    }
  },
  getReferences: async (req, res, next) => {
    try {
      const currentPage = Number(req.query.page) || 1
      const dataOffset = (currentPage - 1) * 10
      const id = req.params.id
      const element = await Element.findByPk(id)
      const references = await sequelize.query(
        'SELECT `References`.*,`Fields`.`name` AS `Field.name`,COUNT(`Quotes`.`reference_id`) AS `count` FROM `Paragraphs` JOIN `Quotes` ON `Paragraphs`.`id` = `Quotes`.`paragraph_id` JOIN `References` ON `Quotes`.`reference_id` = `References`.`id` JOIN `Fields` ON `Fields`.`id` = `References`.`field_id` WHERE `Paragraphs`.`content` LIKE $keyword GROUP BY `Quotes`.`reference_id` ORDER BY `count` DESC ;', {
          bind: { keyword: `%${element.name}%` },
          raw: true,
          nest: true
        }
      )
      if (!references.length) {
        return res.json({
          status: 404,
          message: '找不到相關裁判書!'
        })
      } else {
        const slicedReferences = references.slice(dataOffset, dataOffset + dataPerPage)
        return res.json({
          status: 200,
          data: { references: slicedReferences },
          pagination: { currentPage, totalPage: countTotalPage(references.length) }
        })
      }
    } catch (err) {
      next(err)
    }
  },
  getArticles: async (req, res, next) => {
    try {
      const currentPage = req.query.page || 1
      const dataOffset = (currentPage - 1) * 10
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
        return res.json({
          status: 404,
          message: '找不到相關條文!'
        })
      } else {
        const slicedArticles = articles.slice(dataOffset, dataOffset + dataPerPage)
        return res.json({
          status: 200,
          data: { articles: slicedArticles },
          pagination: { currentPage, totalPage: countTotalPage(articles.length) }
        })
      }
    } catch (err) {
      next(err)
    }
  },
  getNotes: async (req, res, next) => {
    try {
      const currentPage = Number(req.query.page) || 1
      const dataOffset = (currentPage - 1) * 10
      const id = req.params.id
      const notes = await Note.findAndCountAll({
        where: { elementId: id, userId: getUser(req).id },
        order: [['createdAt', 'DESC']],
        limit: dataPerPage,
        offset: dataOffset,
        nest: true,
        raw: true
      })
      if (!notes.count) {
        res.json({
          status: 404,
          message: '尚未有筆記，請新增!'
        })
      } else {
        const results = notes.rows.map((note) => {
          return {
            ...note,
            relativeTime: dayjs(note.createdAt).fromNow()
          }
        })
        res.json({
          status: 200,
          data: { notes: results },
          pagination: { currentPage, totalPage: countTotalPage(notes.count) }
        })
      }
    } catch (err) {
      next(err)
    }
  },
  getTopKeywords: async (req, res, next) => {
    try {
      const keywords = await sequelize.query(
        'SELECT `Elements`.*,COUNT(`Searches`.`element_id`) AS `count` FROM `Elements` JOIN `Searches` ON `Elements`. `id` = `Searches`.`element_id` GROUP BY `Searches`.`element_id` ORDER BY `count` DESC LIMIT 10;', {
          raw: true,
          nest: true
        }
      )
      return res.json({
        status: 200,
        data: { keywords }
      })
    } catch (err) {
      next(err)
    }
  },
  addKeyword: async (req, res, next) => {
    try {
      const { name } = req.body
      if (!name) {
        return res.json({
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
        return res.json({
          status: 200,
          data: keyword.toJSON()
        })
      }
    } catch (err) {
      next(err)
    }
  }
}
module.exports = keywordsController
