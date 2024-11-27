const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class MembreEquipe extends Model {}

MembreEquipe.init({
    utilisateurId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'utilisateurs',
            key: 'id'
        }
    },
    projetId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projets',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'MembreEquipe',
    tableName: 'membres_equipe', // Nom de la table dans la base de données
    timestamps: false
});

module.exports = MembreEquipe;
