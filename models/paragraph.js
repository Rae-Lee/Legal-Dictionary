'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paragraph extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Paragraph.hasMany(models.Paragraph_article, { foreignKey: 'paragraphId' })
      Paragraph.hasMany(models.Quote, { foreignKey: 'paragraphId' })
    }
  }
  Paragraph.init({
    verdit: DataTypes.STRING,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Paragraph',
    tableName: 'Paragraphs',
    underscored: true
  });
  return Paragraph;
};