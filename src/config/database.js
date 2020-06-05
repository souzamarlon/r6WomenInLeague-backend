require('dotenv/config');
const { Client } = require('pg');

if (process.env.NODE_ENV === 'development') {
  module.exports = {
    dialect: 'postgres',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    define: {
      timestamps: true,
      underscored: true,
      underscoredALL: true,
    },
  };
}

// Heroku

module.exports = {
  dialect: 'postgres',
  define: {
    timestamps: true,
    underscored: true,
    underscoredALL: true,
  },
};
