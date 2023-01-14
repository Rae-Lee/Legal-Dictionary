'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Part extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Part.belongsTo(models.Code, { foreignKey: 'codeId' })
      Part.hasMany(models.Chapter, { foreignKey: 'partId' })
    }
  }
  Part.init({
    name: DataTypes.STRING,
    partNo: DataTypes.INTEGER,
    codeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Part',
    tableName: 'Parts',
    underscored: true,
  });
  return Part;
};