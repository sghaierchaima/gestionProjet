const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class RapportAvancement extends Model {}

RapportAvancement.init({
    projetId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projets', // Référence à la table 'projets'
            key: 'id'
        },
        allowNull: false // Chaque rapport doit être associé à un projet
    },
    dateRapport: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW // Valeur par défaut : la date et l'heure actuelles
    },
    tachesTerminees: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Valeur par défaut : 0 tâches terminées
    },
    tachesRetard: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // Valeur par défaut : 0 tâches en retard
    }
}, {
    sequelize,
    modelName: 'RapportAvancement',
    tableName: 'rapports_avancement', // Nom de la table dans la base de données
    timestamps: true // Permet de suivre les dates de création et de mise à jour
});

RapportAvancement.associate = (models) => {
    // Associe le modèle RapportAvancement à Projet
    RapportAvancement.belongsTo(models.Projet, {
        foreignKey: 'projetId',
        as: 'projet' // Alias pour la relation RapportAvancement-Projet
    });
};

module.exports = RapportAvancement;
