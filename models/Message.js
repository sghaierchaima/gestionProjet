const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'utilisateurs', // Nom de la table corrigé
      key: 'id' // Clé primaire dans utilisateurs
    }
  },
  projetId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'projets', // Nom de la table projets correct
      key: 'id' // Clé primaire dans projets
    }
  },
});

Message.associate = (models) => {
  Message.belongsTo(models.Utilisateur, { foreignKey: 'userId' });
  Message.belongsTo(models.Projet, { foreignKey: 'projetId' });
};

module.exports = Message;
