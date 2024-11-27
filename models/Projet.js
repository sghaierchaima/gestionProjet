const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Projet extends Model {}

Projet.init({
    nom: DataTypes.STRING,
    description: DataTypes.TEXT,
    date_debut: DataTypes.DATE,
    date_fin: DataTypes.DATE,
    utilisateurId: DataTypes.INTEGER
}, { sequelize, modelName: 'projet' });

Projet.associate = (models) => {
    Projet.hasMany(models.Tache, {
        foreignKey: 'projetId',
        as: 'taches'
    });

    Projet.belongsToMany(models.Utilisateur, {
        through: 'MembreEquipe',
        foreignKey: 'projetId',
        as: 'membres'  // alias utilisé pour la relation Utilisateur-Projet
    });
};

module.exports = Projet;
