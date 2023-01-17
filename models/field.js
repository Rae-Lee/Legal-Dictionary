'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Field extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Field.hasMany(models.Quote, { foreignKey: 'fieldId' })
    }
  }
  Field.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Field',
    tableName: 'Fields',
    underscored: true
  });
  return Field;
};