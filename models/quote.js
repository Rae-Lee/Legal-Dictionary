'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Quote extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Quote.belongsTo(models.Reference, { foreignKey: 'referenceId' })
      Quote.belongsTo(models.Paragraph, { foreignKey: 'paragraphId' })
    }
  }
  Quote.init({
    referenceId: DataTypes.INTEGER,
    paragraphId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Quote',
    tableName: 'Quotes',
    underscored: true
  });
  return Quote;
};