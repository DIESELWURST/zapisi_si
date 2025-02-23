import React from 'react';
import { useNavigate } from 'react-router-dom';
import './signIn.css';

const SignIn = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleSignIn = (event) => {
    event.preventDefault();
    // Perform sign-in logic
    setIsAuthenticated(true);
    navigate('/app');
  };

  return (
    <div className='auth-container'>
      <div className='auth-form'>
        <h1>Sign In</h1>
        <form onSubmit={handleSignIn}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" required />
          
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
          
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;