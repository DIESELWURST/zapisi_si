import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './signIn.css';

const SignIn = () => {
  const [credentials, setCreds] = useState('');
  const [password, setPassword] = useState('');
  const [credsError, setCredsError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);


  const checkCreds = async (credentials, password) => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/check-credentials?credentials=${credentials}&password=${password}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking password:', error);
      return false;
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    let valid = true;

    const correctCreds = await checkCreds(credentials, password);
    if (correctCreds) {
      // Handle successful sign-in
    } else {
      setCredsError('It appears that either your login or password is incorrect. Please try again.');
      valid = false;
    }

    if (!valid) {
      return;
    }

    // Additional logic for successful sign-in can be added here
  };

  return (
    <div>
      <Link to="/"><img src='../src/home.png' style={{ margin: '10px 0px 0px 10px' }} /></Link>
      <div className='auth-container'>
        <div className="bee-divider">
          <div className="bee-line"></div>
          <div className="bee-hexagon with-image">
            <img src="assets/images/maja.png" alt="Bee" />
          </div>
          <div className="bee-line"></div>
        </div>
        <div className="kontakt" id="kontakt">
          <div className="bee-divider" style={{marginBottom:'25px'}}>
            <div className="bee-line"></div>
            <div className="bee-hexagon"></div>
            <div className="bee-line"></div>
          </div>
          <form onSubmit={handleSignUp}>
            <h2 style={{marginBottom:'25px'}}>Sign in</h2>
            <label htmlFor="username">Username or email:</label> <br />
            <input
              type="text"
              name="username"
              id="username"
              value={credentials}
              onChange={(e) => setCreds(e.target.value)}
              required
            /> <br />
            {credsError && <p className="error">{credsError}</p>}

            <label htmlFor="password">Password:</label> <br />
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{marginBottom:'50px'}}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style={{ background: 'white', border: 'none', height: '20px', width: '20px', marginTop: '-30px', marginBottom: '50px' }}
              >
                <img src={passwordVisible ? "../src/show-pass.png" : "../src/hide-pass.png"} />
              </button>
            </div>

            <button type="submit" style={{marginBottom:'50px'}}>Sign In</button>
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
    </div>
  );
};

export default SignIn;