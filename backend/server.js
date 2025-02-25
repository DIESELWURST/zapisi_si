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
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQLPORT 
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// Endpoint , ki pregleda, če obstaja vnesen uporabnik
app.get('/api/user-exists', (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const query = 'SELECT * FROM User WHERE username = ?';

  connection.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length > 0) {
      return res.json({ exists: true, message: '1' });
    } else {
      return res.json({ exists: false, message: '0' });
    }
  });
});

// Endpoint , ki pregleda, če obstaja vnesen uporabnik
app.get('/api/mail-exists', (req, res) => {
  const mail = req.query.mail;
  if (!mail) {
    return res.status(400).json({ error: 'Mail is required' });
  }

  const query = 'SELECT * FROM User WHERE email = ?';

  connection.query(query, [mail], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length > 0) {
      return res.json({ exists: true, message: '1' });
    } else {
      return res.json({ exists: false, message: '0' });
    }
  });
});

// Endpoint, ki doda novega uporabnika in ustvari privzeto stran
app.post('/api/add-user', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  const query = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';

  connection.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error('Error adding user to the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    const userId = results.insertId;
    const defaultPage = {
      title: 'Welcome to ZapišiSi!',
      components: JSON.stringify([
        { id: 1, type: "textBlock", content: "Getting Started!" },
        {
          id: 2,
          type: "checklist",
          items: [
            { id: 1, content: "Click and type anywhere", checked: false },
            { id: 2, content: "Drag items to reorder them", checked: false },
          ],
        },
        {
          id: 3,
          type: "toggleBlock",
          title: "This is a toggle block.",
          content: "Here's some info about toggles.",
        },
      ]),
    };

    const pageQuery = 'INSERT INTO Page (userId, title, components) VALUES (?, ?, ?)';
    connection.query(pageQuery, [userId, defaultPage.title, defaultPage.components], (err, pageResults) => {
      if (err) {
        console.error('Error creating default page:', err);
        return res.status(500).json({ error: 'Internal server error', details: err });
      }

      return res.json({ message: 'User and default page added successfully' });
    });
  });
});

// Endpoint , ki pregleduje vpis uporabnika
app.get('/api/check-credentials', (req, res) => {
  const credentials = req.query.credentials;
  const password = req.query.password;
  if (!credentials || !password) {
    return res.status(400).json({ error: 'Credentials and password are required' });
  }

  const query = 'SELECT * FROM User WHERE (username = ? OR email = ?) AND password = ?';

  connection.query(query, [credentials, credentials, password], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length > 0) {
      return res.json({ exists: true, user: results[0], message: '1' });
    } else {
      return res.json({ exists: false, message: '0' });
    }
  });
});

// Endpoint preko katerega posegamo po straneh uporabnika
app.get('/api/user-pages', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = 'SELECT * FROM Page WHERE userId = ?';

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    return res.json({ pages: results });
  });
});

// Endpoint za dodajanje nove strani
app.post('/api/add-page', (req, res) => {
  const { userId, title, components } = req.body;
  if (!userId || !title || !components) {
    return res.status(400).json({ error: 'User ID, title, and components are required' });
  }

  const query = 'INSERT INTO pages (userId, title, components) VALUES (?, ?, ?)';

  connection.query(query, [userId, title, components], (err, results) => {
    if (err) {
      console.error('Error adding page to the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    return res.json({ message: 'Page added successfully', pageId: results.insertId });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});