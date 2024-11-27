const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Utilisateur extends Model {}

Utilisateur.init({
    nom: DataTypes.STRING,
    email: DataTypes.STRING,
    mot_de_passe: DataTypes.STRING,
    photo: DataTypes.STRING
}, { sequelize, modelName: 'utilisateur' });

Utilisateur.associate = (models) => {
    Utilisateur.hasMany(models.Projet, {
        foreignKey: 'utilisateurId',
        as: 'mesProjets'
    });

    Utilisateur.hasMany(models.Tache, {
        foreignKey: 'utilisateurId',
        as: 'taches'
    });

    Utilisateur.belongsToMany(models.Projet, {
        through: models.MembreEquipe,
        foreignKey: 'utilisateurId',
        as: 'projetsPartages'  // alias utilisé pour la relation Projet-Utilisateur
    });
};

module.exports = Utilisateur;
