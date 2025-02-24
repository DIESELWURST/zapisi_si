import React, { useState } from 'react';
import './signUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const checkUsername = async (username) => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/user-exists?username=${username}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    let valid = true;

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    const usernameExists = await checkUsername(username);
    if (usernameExists) {
      setUsernameError('Username already exists');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    // Add new user to the database
    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        alert('User registered successfully');
        setEmail('');
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred while adding the user');
    }
  };

  return (
    <div className='auth-container'>
      <div className="bee-divider">
        <div className="bee-line"></div>
        <div className="bee-hexagon with-image">
          <img src="assets/images/maja.png" alt="Bee" />
        </div>
        <div className="bee-line"></div>
      </div>
      <div className="kontakt" id="kontakt">
        <div className="bee-divider">
          <div className="bee-line"></div>
          <div className="bee-hexagon"></div>
          <div className="bee-line"></div>
        </div>
        <form onSubmit={handleSignUp}>
          <h2>Sign Up</h2>
          <label htmlFor="username">Username:</label> <br />
          <input
            type="text"name="username"id="username"val={username} onChange={(e)=> setUsername(e.target.value )} required/> <br />
          {usernameError && <p className="error">{usernameError}</p>}

          <label htmlFor="password">Password:</label> <br />
          <input type="password" name="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required/> <br />
          
          <label htmlFor="confirmPassword">Please enter password again:</label> <br />
          <input type="password" name="confirmPassword" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/> <br />

          <label htmlFor="email">Email:</label> <br />
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /> <br />
          {emailError && <p className="error">{emailError}</p>}

          <button type="submit">Sign Up</button>
        </form>
      </div>
      <div className="bee-divider">
        <div className="bee-line"></div>
        <div className="bee-hexagon with-image">
          <img src="assets/images/maja.png" alt="Bee" />
        </div>
        <div className="bee-line"></div>
      </div>
    </div>
  );
};

export default SignUp;