'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Note.belongsTo(models.User, { foreignKey: 'userId' })
      Note.belongsTo(models.Element, { foreignKey: 'elementId' })
    }
  }
  Note.init({
    userId: DataTypes.INTEGER,
    elementId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Note',
    tableName: 'Notes',
    underscored: true
  });
  return Note;
};