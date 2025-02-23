import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.get('/api/check-username', (req, res) => {
  const { username } = req.query;
  const query = 'SELECT 1 FROM users WHERE username = ?';

  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json({ exists: results.length > 0 });
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});