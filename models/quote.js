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
      Quote.belongsToMany(models.Element, { through: models.QuoteElement, foreignKey: 'elementId', as: 'QuotedElements' })
      Quote.belongsTo(models.Reference, { foreignKey: 'referenceId' })
    }
  }
  Quote.init({
    verdit: DataTypes.STRING,
    content: DataTypes.TEXT,
    referenceId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Quote',
    tableName: 'Quotes',
    underscored: true
  });
  return Quote;
};