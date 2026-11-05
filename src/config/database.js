const { Sequelize } = require('sequelize');
<<<<<<< HEAD
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST, port: Number(process.env.DB_PORT || 3306), dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  timezone: '+00:00', pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  define: { underscored: true, timestamps: true }
});
module.exports = sequelize;
=======
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;
>>>>>>> afaa8b5e1979c84496ffb65c1d78942d4029050b
