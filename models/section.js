'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Section extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Section.belongsTo(models.Chapter, { foreignKey: 'chapterId' })
      Section.hasMany(models.Article, { foreignKey: 'sectionId' })
    }
  }
  Section.init({
    name: DataTypes.STRING,
    sectionNo: DataTypes.INTEGER,
    chapterId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Section',
    tableName: 'Sections',
    underscored: true
  });
  return Section;
};