'use strict'
const reference = require('../data/reference.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for (const data of reference.data) {
      let result = [{
        ...data,
        created_at: new Date(),
        updated_at: new Date()
      }]
      await queryInterface.bulkInsert('References', result, {})
      result = null
    }
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('References', null, {})
  }
}
