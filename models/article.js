'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Article.belongsTo(models.Code, { foreignKey: 'codeId' })
      Article.belongsToMany(models.Element, { through: models.Article_element, foreignKey: 'elementId', as: 'ArticleElements' })
    }
  }
  Article.init({
    content: DataTypes.TEXT,
    articleNo: DataTypes.STRING,
    codeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Article',
    tableName: 'Articles',
    underscored: true
  });
  return Article;
};