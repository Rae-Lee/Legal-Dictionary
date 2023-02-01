'use strict'
const law = require('../ChLaw.json')
const result = law.Laws.map(l => {
  if (l.LawAbandonNote === '廢') {
    return {
      name: l.LawName,
      is_abandon: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  }
  return {
    name: l.LawName,
    is_abandon: false,
    created_at: new Date(),
    updated_at: new Date()
  }
}) // 匯入法規名稱
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Codes', result, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Codes', null, {})
  }
}
