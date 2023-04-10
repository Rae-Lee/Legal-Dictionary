'use strict';
const { getParagraph } = require('../helpers/seed-helpers')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 爬範圍內所有刑事裁判書中引用的段落
    const judType = '刑事'
    const startDate = '111-1-1'
    const endDate = '111-12-31'
    let paragraphs = await getParagraph(judType, startDate, endDate)
   
    let result = paragraphs.map(p => {
      return {
        verdit: p.verditName,
        content: p.content,
        created_at: new Date(),
        updated_at: new Date()
      }
    })
    // 放入資料庫
    await queryInterface.bulkInsert('Paragraphs', result, {})
    result = null
    paragraphs = null
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paragraphs', null, {})
  }
};
