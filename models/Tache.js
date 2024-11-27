const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assurez-vous que ce chemin est correct

class Tache extends Model {}

Tache.init({
    titre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true // Description est facultative
    },
    date_echeance: {
        type: DataTypes.DATE,
        allowNull: true // Date d'échéance facultative
    },
    priorite: {
        type: DataTypes.ENUM('haut', 'moyenne', 'basse'),
        allowNull: false,
        defaultValue: 'moyenne' // Priorité par défaut est "moyenne"
    },
    statut: {
        type: DataTypes.ENUM('à faire', 'en cours', 'terminée'),
        defaultValue: 'à faire'
    },
    projetId: {
        type: DataTypes.INTEGER,
        references: {
            model: 'projets', // Référence au modèle Projet
            key: 'id' // La clé primaire de la table projets
        },
        allowNull: false // La tâche doit être liée à un projet
    },
    utilisateurId: { // Ajoutez ceci pour la relation avec Utilisateur
        type: DataTypes.INTEGER,
        references: {
            model: 'utilisateurs', // Nom de la table des utilisateurs
            key: 'id'
        },
        allowNull: true // Peut être facultatif si certaines tâches n'ont pas d'utilisateur assigné
    }
}, {
    sequelize,
    modelName: 'Tache',
    tableName: 'taches',
    timestamps: true, // Si vous voulez des champs `createdAt` et `updatedAt`
});

// Définir la relation entre Tache et Projet
Tache.associate = (models) => {
    Tache.belongsTo(models.Utilisateur, { foreignKey: 'utilisateurId', as: 'utilisateur' });
    // Utiliser un alias unique pour chaque association
    Tache.belongsTo(models.Projet, {
        foreignKey: 'projetId',
        as: 'taches' // Alias unique
    });
};

module.exports = Tache;
