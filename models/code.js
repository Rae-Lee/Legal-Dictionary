'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Code extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Code.hasMany(models.Part, { foreignKey: 'codeId' })
      Code.hasMany(models.Article, { foreignKey: 'codeId' })
      Code.hasMany(models.Chapter, { foreignKey: 'codeId' })
      Code.belongsTo(models.Field, { foreignKey: 'fieldId' })
    }
  }
  Code.init({
    name: DataTypes.STRING,
    fieldId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Code', 
    tableName: 'Codes',
    underscored: true,
  });
  return Code;
};