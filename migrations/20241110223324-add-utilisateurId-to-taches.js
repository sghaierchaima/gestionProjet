'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('taches', 'utilisateurId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'utilisateurs', // Assurez-vous que le nom correspond à la table des utilisateurs dans la base de données
        key: 'id'
      },
      allowNull: true, // Permettre les valeurs NULL si certaines tâches n'ont pas encore d'utilisateur
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
