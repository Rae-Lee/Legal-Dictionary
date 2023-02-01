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
      Code.hasMany(models.Article, { foreignKey: 'codeId' })
    }
  }
  Code.init({
    name: DataTypes.STRING,
    isAbandon: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Code', 
    tableName: 'Codes',
    underscored: true,
  });
  return Code;
};