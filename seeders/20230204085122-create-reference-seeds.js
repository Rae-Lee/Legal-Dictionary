'use strict'
const { getReference } = require('../helpers/seed-helpers')
const db = require('../models')
const { Paragraph, Field } = db
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
        if (referenceName.includes('台上')) {
          // 被引用的裁判書內容
          const result = await getReference(judType, referenceName)
          if (result.name) {
            // 被引用的裁判書分類
            let field
            if (result.name.includes('刑事判決')) {
              field = await Field.findOne({
                where: { name: '刑事判決' }
              })
            } else if (result.name.includes('民事判決')) {
              field = await Field.findOne({
                where: { name: '民事判決' }
              })
            } else if (result.name.includes('行政判決')) {
              field = await Field.findOne({
                where: { name: '行政判決' }
              })
            } else if (result.name.includes('台上大') && result.name.includes('刑事')) {
              field = await Field.findOne({
                where: { name: '大法庭刑事裁定' }
              })
            } else if (result.name.includes('台上大') && result.name.includes('民事')) {
              field = await Field.findOne({
                where: { name: '大法庭民事裁定' }
              })
            }
            // 資料存到References table
            await queryInterface.bulkInsert('References', [{
              field_id: field.id,
              content: result.content,
              name: result.name,
              created_at: new Date(),
              updated_at: new Date()
            }], {})
          }
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
