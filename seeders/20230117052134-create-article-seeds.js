'use strict'
const law = require('../ChLaw.json').Laws
const db = require('../models')
const { Code } = db

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 匯入法規內容
    for (const l of law) {
      // 尋找法規在資料庫中的id
      const code = await Code.findOne({ where: { name: l.LawName } })
      // 刪除法規中編章節項次
      const content = l.LawArticles.filter(c =>
        c.ArticleType === 'A'
      )
      // 資料整理到result陣列中
      let result = []
      for (const a of content) {
        const number = a.ArticleNo.includes('第') ? a.ArticleNo.slice(1, a.ArticleNo.length - 1) : a.ArticleNo
        result.push({
          article_no: number.trim(),
          content: a.ArticleContent,
          code_id: code.id,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
      // 放入資料庫
      await queryInterface.bulkInsert('Articles', result, {})
      result = null
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Articles', null, {})
  }
}
