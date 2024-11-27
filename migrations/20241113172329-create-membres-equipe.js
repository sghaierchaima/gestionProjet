'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('membres_equipe', {
      utilisateurId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'utilisateurs',  // Table 'utilisateurs'
          key: 'id'
        },
        onDelete: 'CASCADE'  // Suppression en cascade
      },
      projetId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'projets',  // Table 'projets'
          key: 'id'
        },
        onDelete: 'CASCADE'  // Suppression en cascade
      }
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
