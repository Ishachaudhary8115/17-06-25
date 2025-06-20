const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // your DB username
  password: '',        // your DB password
  database: 'cruddb'  //  DB name
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL DB');

  // Create users table if it doesn't exist
  const createUsersTableQuery = `
  CREATE TABLE IF NOT EXISTS stud (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15) NOT NULL
);
  `;

  db.query(createUsersTableQuery, (err) => {
    if (err) {
      console.error('Failed to create users table:', err);
    } else {
      console.log('User table ensured in database');
    }
  });
});

module.exports = db;
