'use strict'
const db = require('../models')
const { Paragraph } = db
const { getArticleId } = require('../helpers/seed-helpers')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let result = []
    const paragraphs = await Paragraph.findAll()
    for (const paragraph of paragraphs) {
      // 尋找段落中的法條id
      const articleId = await getArticleId(paragraph)
      if (articleId) {
        for (const id of articleId) {
          result.push({
            article_id: id,
            paragraph_id: paragraph.id,
            created_at: new Date(),
            updated_at: new Date()
          })
        }
      }
    }
    await queryInterface.bulkInsert('Paragraph_articles', result, {})
    result = null
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paragraph_articles', null, {})
  }
}
