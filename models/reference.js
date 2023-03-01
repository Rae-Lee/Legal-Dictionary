'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reference extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reference.hasMany(models.Quote, { foreignKey: 'referenceId' })
      Reference.belongsTo(models.Field, { foreignKey: 'fieldId' })
    }
  }
  Reference.init({
    name: DataTypes.STRING,
    content: DataTypes.TEXT('long'),
    quote: DataTypes.TEXT,
    fieldId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Reference',
    tableName: 'References',
    underscored: true
  });
  return Reference;
};