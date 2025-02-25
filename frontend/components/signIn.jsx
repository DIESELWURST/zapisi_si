import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './signUp.css';

const SignUp = () => {
  const [credentials, setCreds] = useState('');
  const [password, setPassword] = useState('');
  const [CredsError, setCredsError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  
  const checkCreds = async (credentials,password) => {
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

    const correctCreds = await checkCreds(credentials,password);
    if (correctCreds) {
    } else {
      setCredsError('It appears that either your log in or password is incorrect. Please try again.');
      valid = false;
    }

    if (!valid) {
      return;
    }

  };

  return  (
    <div>
            <Link to="/"><img src='../src/home.png' style= {{margin:'10px 0px 0px 10px'}}/></Link>
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
            <h2>Sign in</h2>
            <label htmlFor="username">Username or email:</label> <br />
            <input
              type="text"
              name="username"
              id="username"
              value={username}
              onChange={(e) => setCreds(e.target.value)}
              required
            /> <br />
            {CredsError && <p className="error">{CredsError}</p>}

            <label htmlFor="password">Password:</label> <br />
            <div className="password-container">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setPasswordVisible(!passwordVisible)}
                style= {{background:' white', border: 'none',height: '20px', width: '20px' ,marginTop: '-13px'}}
              >
                <img src={passwordVisible ? "../src/show-pass.png" : "../src/hide-pass.png"}  />
              </button>
            </div>

            <button type="submit">Sign In</button>
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

export default SignUp;