/* const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Assurez-vous que ce fichier contient l'instance de Sequelize

// Importez les autres modèles nécessaires
const Utilisateur = require('./Utilisateur');  // Exemple, à ajuster selon la localisation du modèle Utilisateur
const Projet = require('./Projet');  // Exemple, à ajuster selon la localisation du modèle Projet
const MembreEquipe = require('./MembreEquipe');  // Exemple, à ajuster selon la localisation du modèle MembreEquipe

class Invitation extends Model {}

Invitation.init({
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true, // Validation du format de l'email
        }
    },
    projetId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true // Le token doit être unique pour chaque invitation
    },
    expiredAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize, // L'instance de Sequelize
    modelName: 'Invitation', // Le nom du modèle
    tableName: 'invitations', // Le nom de la table dans la base de données
    timestamps: true, // Active les timestamps si nécessaire
});

// Définir les relations
Invitation.belongsTo(Utilisateur, { foreignKey: 'email', targetKey: 'email' });
Invitation.belongsTo(Projet, { foreignKey: 'projetId' });

MembreEquipe.belongsTo(Projet, { foreignKey: 'projetId' });
MembreEquipe.belongsTo(Utilisateur, { foreignKey: 'utilisateurId' });

module.exports = Invitation;
 */