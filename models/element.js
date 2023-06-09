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
      Element.hasMany(models.Note, { foreignKey: 'elementId' })
      Element.hasMany(models.Favorite, { foreignKey: 'elementId' })
      Element.hasMany(models.Search, { foreignKey: 'elementId' })
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