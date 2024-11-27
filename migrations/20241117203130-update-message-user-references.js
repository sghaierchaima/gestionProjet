'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Messages', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'utilisateurs', // Nom corrigé ici
        key: 'id'
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
