'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rapports_avancement', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      projetId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'projets', // Référence à la table 'projets'
          key: 'id'
        },
        allowNull: false
      },
      dateRapport: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      tachesTerminees: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      tachesRetard: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rapports_avancement');
  }
};
