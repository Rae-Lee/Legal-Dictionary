'use strict'
const article = require('../paragraphArticle.json')
let result = article.data.map(a => {
  return {
    ...a,
    created_at: new Date(),
    updated_at: new Date()
  }
})
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paragraph_articles', result, {})
    result = null
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paragraph_articles', null, {})
  }
}
