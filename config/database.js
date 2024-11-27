const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gestion_projet', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3306 // Port utilisé par MySQL dans XAMPP
});

module.exports = sequelize;