'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Paragraph_article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Paragraph_article.belongsTo(models.Article, { foreignKey: 'articleId' })
      Paragraph_article.belongsTo(models.Paragraph, { foreignKey: 'paragraphId' })
    }
  }
  Paragraph_article.init({
    articleId: DataTypes.INTEGER,
    paragraphId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Paragraph_article',
    tableName: 'Paragraph_articles',
    underscored: true
  });
  return Paragraph_article;
};