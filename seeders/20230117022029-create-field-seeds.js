'use strict'
const field = ['民事判決', '刑事判決', '行政判決', '大法庭民事裁定', '大法庭刑事裁定', '大法官解釋', '行政函釋', '民事庭會議決議', '刑事庭會議決議']
const result = field.map(f => {
  return {
    name: f,
    created_at: new Date(),
    updated_at: new Date()
  }
})
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Fields', result, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
}
