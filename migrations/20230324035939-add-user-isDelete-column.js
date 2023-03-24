'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'is_delete', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'is_delete')
  }
};
