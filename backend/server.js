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

// Endpoint to check if a user exists by username
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

// Endpoint to check if a user exists by email
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

// Endpoint to add a new user and create a default page
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
      content: JSON.stringify([
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

    const pageQuery = 'INSERT INTO Page (title, content) VALUES (?, ?)';
    connection.query(pageQuery, [defaultPage.title, defaultPage.content], (err, pageResults) => {
      if (err) {
        console.error('Error creating default page:', err);
        return res.status(500).json({ error: 'Internal server error', details: err });
      }

      const pageId = pageResults.insertId;
      const ownerQuery = 'INSERT INTO Owner (user_id, page_id) VALUES (?, ?)';
      connection.query(ownerQuery, [userId, pageId], (err, ownerResults) => {
        if (err) {
          console.error('Error linking user to page:', err);
          return res.status(500).json({ error: 'Internal server error', details: err });
        }

        return res.json({ message: 'User and default page added successfully' });
      });
    });
  });
});

// Endpoint to check user credentials
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

// Endpoint to fetch user pages
app.get('/api/user-pages', (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const query = `
    SELECT Page.page_id, Page.title, Page.content
    FROM Page
    JOIN Owner ON Page.page_id = Owner.page_id
    WHERE Owner.user_id = ?
  `;

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    return res.json({ pages: results });
  });
});

// Endpoint to add a new page
app.post('/api/add-page', (req, res) => {
  const { userId, title, content } = req.body;
  if (!userId || !title || !content) {
    return res.status(400).json({ error: 'User ID, title, and content are required' });
  }

  const query = 'INSERT INTO Page (title, content) VALUES (?, ?)';

  connection.query(query, [title, content], (err, results) => {
    if (err) {
      console.error('Error adding page to the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    const pageId = results.insertId;
    const ownerQuery = 'INSERT INTO Owner (user_id, page_id) VALUES (?, ?)';
    connection.query(ownerQuery, [userId, pageId], (err, ownerResults) => {
      if (err) {
        console.error('Error linking user to page:', err);
        return res.status(500).json({ error: 'Internal server error', details: err });
      }

      return res.json({ message: 'Page added successfully', pageId });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});