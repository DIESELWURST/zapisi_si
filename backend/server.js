import express from 'express';
import mysql from 'mysql2';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import argon2 from 'argon2';

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


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Generiramo OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Pošljemo verifikacijsko kodo
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
      text: `Your code is: ${otp}`,
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

// Endpoint za preverjanje že obstoječih uporabnikov
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

// Endpoint za preveranje že obstoječih emailov
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

// Endpoint, ki doda novega uporabnika ter mu doda privzeto stran
app.post('/api/add-user', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // hashamo geslo z argon2
    const hashedPassword = await argon2.hash(password);

    const query = 'INSERT INTO User (username, email, password) VALUES (?, ?, ?)';

    connection.query(query, [username, email, hashedPassword], (err, results) => {
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
  } catch (error) {
    console.error('Error hashing password:', error);
    return res.status(500).json({ error: 'Internal server error', details: error });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    return res.status(400).json({ error: 'Email, verification code, and new password are required' });
  }

  const query = 'SELECT verification_code, verification_expires FROM User WHERE email = ?';
  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length === 0 || results[0].verification_code !== code || new Date() > new Date(results[0].verification_expires)) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    try {
      // Hashamo novo geslo z argon2
      const hashedPassword = await argon2.hash(password);

      const updateQuery = 'UPDATE User SET password = ?, verification_code = NULL, verification_expires = NULL WHERE email = ?';
      connection.query(updateQuery, [hashedPassword, email], (err, updateResults) => {
        if (err) {
          console.error('Error updating user password:', err);
          return res.status(500).json({ error: 'Internal server error', details: err });
        }

        return res.json({ message: 'Password reset successfully' });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      return res.status(500).json({ error: 'Internal server error', details: error });
    }
  });
});

// Endpoint za pregledovanje uporabniških podatkov
app.get('/api/check-credentials', async (req, res) => {
  const credentials = req.query.credentials;
  const password = req.query.password;
  if (!credentials || !password) {
    return res.status(400).json({ error: 'Credentials and password are required' });
  }

  const query = 'SELECT * FROM User WHERE username = ? OR email = ?';

  connection.query(query, [credentials, credentials], async (err, results) => {
    if (err) {
      console.error('Error querying the database:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = results[0];
    try {
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      if (!user.verified) {
        return res.status(403).json({ error: 'Email not verified. Please verify your email before signing in.' });
      }

      return res.json({ exists: true, user, message: '1' });
    } catch (error) {
      console.error('Error verifying password:', error);
      return res.status(500).json({ error: 'Internal server error', details: error });
    }
  });
});

// Endpoint, ki vrne vse uporabniške strani
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
    Order by Page.last_edited DESC
  `;

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

app.post('/api/delete-page', (req, res) => {
  const pageId = req.query.pageId;
  if (!pageId) {
    return res.status(400).json({ error: 'Page ID is required' });
  }
  const queryOwner = 'DELETE FROM Owner WHERE page_id = ?';
  connection.query(queryOwner, [pageId], (err, results) => {
    if (err) {
      console.error('Error deleting page:', err);
      return res.status(500).json({ error: 'Internal server error - Owner constraint issue', details: err });
    }
  });
  const query = 'DELETE FROM Page WHERE page_id = ?';
  connection.query(query, [pageId], (err, results) => {
    if (err) {
      console.error('Error deleting page:', err);
      return res.status(500).json({ error: 'Internal server error - Page deletion issue', details: err });
    }

    return res.json({ message: 'Page deleted successfully' });
  });
});

// Endpoint za posodabljanje strani
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


app.post('/api/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' });
  }

  const query = 'SELECT verification_code, verification_expires FROM User WHERE  email = ?';
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


// Endoint zaprosi za OTP za ponastavitev gesla
app.post('/api/request-reset-otp', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minut

  const query = 'UPDATE User SET verification_code = ?, verification_expires = ? WHERE email = ?';
  connection.query(query, [otp, expiresAt, email], (err, results) => {
    if (err) {
      console.error('Error updating reset code:', err);
      return res.status(500).json({ error: 'Internal server error', details: err });
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER, 
      subject: 'Reset Your Password',
      text: `Your password reset code is: ${otp}`,
    };

    sgMail.send(msg)
      .then(() => {
        console.log('Password reset email sent');
        return res.json({ message: 'OTP sent successfully' });
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error);
        return res.status(500).json({ error: 'Error sending password reset email' });
      });
  });
});



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});