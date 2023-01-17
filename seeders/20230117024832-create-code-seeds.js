'use strict'
const law = require('../ChLaw.json')
const result = law.Laws.map(l => {
  return {
    name: l.LawName,
    created_at: new Date(),
    updated_at: new Date()
  }
}) // 匯入法規名稱
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Codes', result, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
}
