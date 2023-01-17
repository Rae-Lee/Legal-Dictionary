'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quote_element extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Quote_element.init({
    quoteId: DataTypes.INTEGER,
    elementId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Quote_element',
    tableName: 'Quote_elements',
    underscored: true
  });
  return Quote_element;
};