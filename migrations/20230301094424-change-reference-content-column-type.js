'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('References', 'content', {
      type: Sequelize.TEXT('long')
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('References', 'content', {
      type: Sequelize.TEXT
    })
  }
};
