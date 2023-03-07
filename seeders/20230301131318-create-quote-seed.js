'use strict'
const db = require('../models')
const { Paragraph, Reference } = db
const { getReferenceName } = require('../helpers/seed-helpers')
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    let result = []
    const paragraphs = await Paragraph.findAll()
    const judType = '刑事'
    for (const paragraph of paragraphs) {
      const referenceNames = paragraph.content.match(/\d{2,3}[\u4e00-\u9fa5]{5,7}\d+[\u4e00-\u9fa5]/g)
      for (const referenceName of referenceNames) {
        const name = await getReferenceName(referenceName, judType)
        if (name) {
          const reference = await Reference.findOne({ where: { name } })
          if (reference) {
            result.push({
              paragraph_id: paragraph.id,
              reference_id: reference.id,
              created_at: new Date(),
              updated_at: new Date()
            })
          }
        }
      }
    }
    await queryInterface.bulkInsert('Quotes', result, {})
    result = null
  },

  async down (queryInterface, Sequelize) {
    queryInterface.bulkDelete('Quotes', null, {})
  }
}
