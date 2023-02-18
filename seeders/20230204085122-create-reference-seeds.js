'use strict'
const { getQuote, getReference } = require('../helpers/seed-helpers')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const result = []
    const quotes = await getQuote()
    for (const quote of quotes) {
      const name = quote.slice(quote.lastIndexOf('（') + 1, quote.indexOf('意旨'))// 被引用的裁判書名稱
      const content = await getReference(name)
      result.push({
        name,
        content
      })
    }
    await queryInterface.bulkInsert('References', result, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
