'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Article_element extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ArticleElement.init({
    articleId: DataTypes.INTEGER,
    elementId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ArticleElement',
    tableName: 'Article_elements',
    underscored: true
  });
  return ArticleElement;
};