'use strict'
const quote = require('../data/quote.json')
let result = quote.data.map(q => {
  return {
    ...q,
    created_at: new Date(),
    updated_at: new Date()
  }
})
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Quotes', result, {})
    result = null
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('Quotes', null, {})
  }
}
