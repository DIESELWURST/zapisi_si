import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

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

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Send verification code
const sendVerificationCode = async (email) => {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

  const query = 'UPDATE User SET verification_code = ?, verification_expires = ? WHERE email = ?';
  connection.query(query, [otp, expiresAt, email], (err, results) => {
    if (err) {
      console.error('Error updating verification code:', err);
      return;
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER, // Use the verified email address
      subject: 'Verify Your Email',
      text: `Your verification code is: ${otp}`,
    };

    sgMail.send(msg)
      .then(() => {
        console.log('Verification email sent');
      })
      .catch((error) => {
        console.error('Error sending verification email:', error);
      });
  });
};

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
      userId: userId,
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
          content: "• Here's some info about toggles.",
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

        sendVerificationCode(email);

        return res.json({ message: 'User and default page added successfully. Please verify your email.' });
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
      const user = results[0];
      if (!user.verified) {
        return res.status(403).json({ error: 'Email not verified. Please verify your email before signing in.' });
      }
      return res.json({ exists: true, user, message: '1' });
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

// Endpoint to update a page
app.post('/api/update-page', (req, res) => {
  const { page_id, title, content, user_id } = req.body;
  if (!page_id || !title || !content || !user_id) {
    return res.status(400).json({ error: 'Page ID, title, content, and user ID are required' });
  }

  const updatePageQuery = 'UPDATE Page SET title = ?, content = ?, last_edited = NOW() WHERE page_id = ?';

  connection.query(updatePageQuery, [title, content, page_id], (err, results) => {
    if (err) {
      console.error('Error updating page:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    return res.json({ message: 'Page updated successfully' });
  });
});

// Endpoint to verify OTP
app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const query = 'SELECT verification_code, verification_expires FROM User WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length === 0 || results[0].verification_code !== code || new Date() > new Date(results[0].verification_expires)) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    const updateQuery = 'UPDATE User SET verified = 1, verification_code = NULL, verification_expires = NULL WHERE email = ?';
    connection.query(updateQuery, [email], (err, updateResults) => {
      if (err) {
        console.error('Error updating user status:', err);
        return res.status(500).json({ error: 'Internal server error', details: err });
      }

      return res.json({ message: 'Email verified successfully' });
    });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});