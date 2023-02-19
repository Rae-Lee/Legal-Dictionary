'use strict'
const { getReference } = require('../helpers/seed-helpers')
const db = require('../models')
const { Paragraph, Field } = db
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const references = []
    // 爬被引用的裁判書內容
    const paragraphs = await Paragraph.findAll({ attributes: ['content'] })
    for(const paragraph of paragraphs) {
      // 被引用的裁判書名稱及類型
      const judType = '刑事'
      const referenceName = paragraph.content.slice(paragraph.content.lastIndexOf('最') + 1, paragraph.content.lastIndexOf('意旨'))
      // 被引用的裁判書內容
      const result = await getReference(judType, referenceName)
      // 被引用的裁判書分類
      let field
      if(result.name.includes('刑事判決')){
        field = await Field.findOne({
          where: { name: '刑事判決' }
        })
      }else if(result.name.includes('民事判決')){
       field = await Field.findOne({
        where: { name: '民事判決' }
       })
      }else if (result.name.includes('行政判決')) {
        field = await Field.findOne({
          where: { name: '行政判決' }
        })
      }else if(result.name.includes('台上大') && result.name.includes('刑事')){
        field = await Field.findOne({
          where: { name: '大法庭刑事裁定' }
        })
      } else (result.name.includes('台上大') && result.name.includes('民事')){
        field = await Field.findOne({
          where: { name: '大法庭民事裁定' }
        })
      }
      // 資料整理到result陣列中
      result.push({
         field_id: field.id,
         content: result.content,
         name: result.linkName,
        created_at: new Date(),
        updated_at: new Date()
      })
    }
    await queryInterface.bulkInsert('References', result, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
