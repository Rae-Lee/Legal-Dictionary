'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Elements', [{
      name: '毒品',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '刑度',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      name: '詐欺',
      created_at: new Date(),
      updated_at: new Date()
    }], {})
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Elements', null, {})
  }
};
