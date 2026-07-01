const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  { host: process.env.DB_HOST, dialect: 'mysql' }
);

async function run() {
  try {
    await sequelize.query(
      `INSERT INTO projects (id, name, start_date, end_date) 
       VALUES (3, 'CRM System', '2026-01-01', '2026-12-31') 
       ON DUPLICATE KEY UPDATE name='CRM System';`
    );
    console.log('Project 3 created');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
