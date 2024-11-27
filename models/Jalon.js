// models/jalon.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Jalon extends Model {}

Jalon.init({
    nom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    date_cible: {
        type: DataTypes.DATE,
        allowNull: false
    },
    etat: {
        type: DataTypes.ENUM('Non démarré', 'En cours', 'Complété'),
        defaultValue: 'Non démarré'
    },
    projetId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projets', // Référence à la table 'projets'
            key: 'id'
        },
        allowNull: false // Chaque jalon doit être associé à un projet
    }
}, {
    sequelize,
    modelName: 'Jalon',
    tableName: 'jalons', // Nom de la table dans la base de données
    timestamps: true
});

Jalon.associate = (models) => {
    // Associe le modèle Jalon à Projet
    Jalon.belongsTo(models.Projet, {
        foreignKey: 'projetId',
        as: 'projet' // Alias pour la relation Jalon-Projet
    });
};

module.exports = Jalon;
