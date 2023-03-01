'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.changeColumn('References', 'content', {
      type: Sequelize.TEXT('long')
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.changeColumn('References', 'content', {
      type: Sequelize.TEXT
    })
  }
};
