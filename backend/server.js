import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

console.log('Environment Variables:');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD);
console.log('MYSQLDATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('PORT:', process.env.PORT);

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT // Ensure this matches your MySQL server port
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.get("/api/user-exists", (req, res) => {
  const query = 'SELECT * FROM users WHERE username = ?';
  const username = req.query.username;

  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Internal server error', details: err });
      return;
    }
    res.json({ message: 'Database connection successful', results });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});