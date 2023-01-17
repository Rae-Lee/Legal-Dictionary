'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Element extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Element.belongsToMany(models.Quote, { through: models.QuoteElement, foreignKey: 'quoteId', as: 'ElementQuotes' })
      Element.belongsToMany(models.Article, { through: models.ArticleElement, foreignKey: 'articleId', as: 'ElementArticles' })
      Element.hasMany(models.Post, { foreignKey: 'elementId' })
      Element.hasMany(models.Note, { foreignKey: 'elementId' })
      Element.hasMany(models.Favorite, { foreignKey: 'elementId' })
    }
  }
  Element.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Element',
    tableName: 'Elements',
    underscored: true
  });
  return Element;
};