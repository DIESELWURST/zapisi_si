import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './signUp.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    const lengthValid = password.length >= 8;
    const uppercaseValid = /[A-Z]/.test(password);
    const lowercaseValid = /[a-z]/.test(password);
    const numberValid = /\d/.test(password);
    const specialCharValid = /[@$!%*?&]/.test(password);
    return {
      lengthValid,
      uppercaseValid,
      lowercaseValid,
      numberValid,
      specialCharValid,
      allValid: lengthValid && uppercaseValid && lowercaseValid && numberValid && specialCharValid,
    };
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

  const checkMail = async (email) => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/mail-exists?mail=${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
  }

  const handleSignUp = async (event) => {
    event.preventDefault();

    let valid = true;

    const emailExists = await checkMail(email);
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else if (emailExists) {
      setEmailError('It seems like you have already registered with this email');
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.allValid) {
      setPasswordError('Invalid password format');
      valid = false;
    } else if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    
    const hashedPassword = await hashPassword(password);

    
    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/add-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password: hashedPassword }),
      });

      if (response.ok) {
        setOtpSent(true);
        alert('User registered successfully. Please check your email to verify your account.');
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred while adding the user');
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      if (response.ok) {
        alert('Email verified successfully');
        setOtp('');
        setOtpError('');
      } else {
        const data = await response.json();
        setOtpError(data.error);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('An error occurred while verifying the OTP');
    }
  };

  const passwordValidation = validatePassword(password);

  return (
    <div style={{ backgroundColor: 'black' }}>
      <Link to="/"><img src='../src/home.png' style={{ margin: '10px 0px 0px 10px' }} /></Link>
      <div className='auth-container'>
        <div className="bee-divider">
          <div className="bee-line"></div>
          <div className="bee-hexagon with-image">
            <img src="../src/zobobovec.png" alt="Pis" />
          </div>
          <div className="bee-line"></div>
        </div>
        <div className="kontakt" id="kontakt">
          <div className="bee-divider">
            <div className="bee-line"></div>
            <div className="bee-hexagon"></div>
            <div className="bee-line"></div>
          </div>
          {!otpSent ? (
            <form onSubmit={handleSignUp}>
              <h2>Sign Up</h2>
              <label htmlFor="username">Username:</label> <br />
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              /> <br />
              {usernameError && <p className="error">{usernameError}</p>}

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
                  style={{ background: 'white', border: 'none', height: '20px', width: '20px', marginTop: '-13px' }}
                >
                  <img src={passwordVisible ? "../src/show-pass.png" : "../src/hide-pass.png"} />
                </button>
              </div>
              {passwordError && <p className="error">{passwordError}</p>}
              <ul className="password-validation">
                <li className={passwordValidation.lengthValid ? 'valid' : 'invalid'}>At least 8 characters</li>
                <li className={passwordValidation.uppercaseValid ? 'valid' : 'invalid'}>At least one uppercase letter</li>
                <li className={passwordValidation.lowercaseValid ? 'valid' : 'invalid'}>At least one lowercase letter</li>
                <li className={passwordValidation.numberValid ? 'valid' : 'invalid'}>At least one number</li>
                <li className={passwordValidation.specialCharValid ? 'valid' : 'invalid'}>At least one special character</li>
              </ul>

              <label htmlFor="confirmPassword">Please enter password again:</label> <br />
              <div className="password-container">
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} style={{ background: 'white', border: 'none', height: '20px', width: '20px', marginTop: '-13px' }}
                >
                  <img src={confirmPasswordVisible ? "../src/show-pass.png" : "../src/hide-pass.png"} />
                </button>
              </div>
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
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <h2>Verify Email</h2>
              <label htmlFor="otp">Enter OTP:</label> <br />
              <input
                type="text"
                name="otp"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              /> <br />
              {otpError && <p className="error">{otpError}</p>}

              <button type="submit">Verify</button>
            </form>
          )}
        </div>
        <div className="bee-divider">
          <div className="bee-line"></div>
          <div className="bee-hexagon with-image">
            <img src="../src/zobobovec.png" alt="Pis" />
          </div>
          <div className="bee-line"></div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;