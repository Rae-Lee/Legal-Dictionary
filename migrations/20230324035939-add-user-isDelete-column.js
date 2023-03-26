'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'deleted_at', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: null
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'deleted_at')
  }
};
