'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'projetId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Projets',  // Assurez-vous que le nom de la table 'Projets' est correct
        key: 'id'
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'projetId');
  }
};
