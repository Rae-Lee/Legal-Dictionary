'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chapter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chapter.belongsTo(models.Part, { foreignKey: 'partId' })
      Chapter.belongsTo(models.Code, { foreignKey: 'codeId' })
      Chapter.hasMany(models.Section, { foreignKey: 'chapterId' })
    }
  }
  Chapter.init({
    name: DataTypes.STRING,
    chapterNo: DataTypes.INTEGER,
    codeId: DataTypes.INTEGER,
    partId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Chapter',
    tableName: 'Chapters',
    underscored: true,
  });
  return Chapter;
};