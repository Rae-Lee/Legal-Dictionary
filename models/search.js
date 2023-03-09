'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Search extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Search.belongsTo(models.Element, { foreignKey: 'elementId' })
    }
  }
  Search.init({
    elementId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Search',
    tableName: 'Searches',
    underscored: true
  });
  return Search;
};