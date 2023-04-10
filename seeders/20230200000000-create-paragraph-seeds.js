'use strict';
const paragraph = require('../paragraph.json')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Paragraphs', paragraph.data, {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Paragraphs', null, {})
  }
};
