import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './signIn.css';

const SignIn = ({ setIsAuthenticated, setUser }) => {
  const [credentials, setCreds] = useState('');
  const [password, setPassword] = useState('');
  const [credsError, setCredsError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter OTP and new password
  const navigate = useNavigate();

  const checkCreds = async (credentials, password) => {
    try {
      const response = await fetch(`https://backend-production-fbab.up.railway.app/api/check-credentials?credentials=${credentials}&password=${password}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking password:', error);
      return false;
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();

    const result = await checkCreds(credentials, password);
    if (result.exists) {
      setIsAuthenticated(true);
      setUser(result.user); // Assuming the backend returns user information
      navigate('/app');
    } else if (result.error) {
      setCredsError(result.error);
    } else {
      setCredsError('It appears that either your login or password is incorrect. Please try again.');
    }
  };

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/request-reset-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setOtpSent(true);
        setResetStep(2); // Move to the next step
      } else {
        const data = await response.json();
        setOtpError(data.error);
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setOtpError('An error occurred while requesting the OTP');
    }
  };

  const handleVerifyOtpAndResetPassword = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('https://backend-production-fbab.up.railway.app/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp, password: newPassword }),
      });

      if (response.ok) {
        alert('Password reset successfully');
        setOtp('');
        setOtpError('');
        setOtpSent(false); // Reset OTP sent state
        setResetStep(1); // Reset to the initial step
      } else {
        const data = await response.json();
        setOtpError(data.error);
      }
    } catch (error) {
      console.error('Error verifying OTP and resetting password:', error);
      setOtpError('An error occurred while verifying the OTP and resetting the password');
    }
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
        {!otpSent ? (
            <form onSubmit={handleSignIn}>
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

              <label htmlFor="password" style={{marginBottom:'10px'}}>Password:</label> <br />
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
                  style={{ background: 'white', border: 'none', height: '20px', width: '20px', marginTop: '-32px', marginBottom: '50px' }}
                >
                  <img src={passwordVisible ? "../src/show-pass.png" : "../src/hide-pass.png"} />
                </button>
              </div>

              <button type="submit" style={{marginBottom:'50px'}}>Sign In</button>
              <button type="button" style={{marginLeft:'-250px', height:'30px',width:'150px',fontSize:'12px'}} onClick={() => setOtpSent(true)}>Reset password?</button>
            </form>
        ) : (
          resetStep === 1 ? (
            <form onSubmit={handleRequestOtp}>
              <h2>Enter your mail:</h2>
              <br />
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              /> <br />
              {otpError && <p className="error">{otpError}</p>}

              <button type="submit">Request OTP</button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpAndResetPassword}>
              <h2>Reset password</h2>
              <label htmlFor="otp">Enter OTP:</label> <br />
              <input
                type="text"
                name="otp"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                style= {{marginBottom:'50px'}}
              /> <br />
              <label htmlFor="newPassword">Enter New Password:</label> <br />
              <input
                type="text"
                name="newPassword"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{marginBottom:'15px'}}
              /> <br />
              {otpError && <p className="error">{otpError}</p>}

              <button type="submit" style={{marginBottom:'35px'}}>Reset Password</button>
            </form>
          )
        )}
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
