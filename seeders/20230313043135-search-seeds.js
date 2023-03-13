'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Searches', [{
      element_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      element_id: 2,
      created_at: new Date(),
      updated_at: new Date()
    }, {
      element_id: 3,
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Searches', null, {})
  }
};
