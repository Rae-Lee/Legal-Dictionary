'use strict';
const paragraph = require('../data/paragraph.json')
let result = paragraph.data.map(p => {
  return {
    ...p,
    created_at: new Date(),
    updated_at: new Date()
  }
})
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paragraphs', result, {})
    result = null
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paragraphs', null, {})
  }
};
