'use strict'
const { getReference, getReferenceName, getReferenceField, getReferenceQuote } = require('../helpers/seed-helpers')
const db = require('../models')
const { Paragraph, Reference } = db
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 爬被引用的裁判書內容
    const paragraphs = await Paragraph.findAll({ attributes: ['content'] })
    for (const paragraph of paragraphs) {
      // 被引用的裁判書名稱及類型
      const judType = '刑事'
      const referenceNames = paragraph.content.match(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
      for (const referenceName of referenceNames) {
        if ((referenceName.includes('台上') || referenceName.includes('臺上'))) {
        // 排除已經爬過的裁判書
          const name = await getReferenceName(referenceName, judType)
          if (name) {
            const isCrawled = await Reference.findOne({ where: { name } })
            // 若還未爬過開始爬蟲
            if (!isCrawled) {
              // 被引用的裁判書內容
              const result = await getReference(judType, name)
              if (result.content) {
                // 被引用的裁判書分類
                const field = await getReferenceField(result)
                // 被引用的段落
                const quote = await getReferenceQuote(paragraph, result)
                // 資料存到References table
                await queryInterface.bulkInsert('References', [{
                  field_id: field.id,
                  content: result.content,
                  quote,
                  name: result.name,
                  created_at: new Date(),
                  updated_at: new Date()
                }], {})
              }
            }
          }
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
