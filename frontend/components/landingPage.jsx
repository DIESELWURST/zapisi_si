import React from 'react';
import { Link } from 'react-router-dom';
import './landingPage.css';

const LandingPage = () => (
  <div className='landing-container'>
    <div className='navbar'>
      <h2>ZapišiSi</h2>
      <div className='buttons'>
        <Link to="/signin"><button className='topbar-signin'><b>Sign in</b></button></Link>
        <Link to="/signup"><button className='topbar-signup'><b>Sign up</b></button></Link>
      </div>
    </div>

    <div className='intro'>
      <h1>Capture Your Thoughts Seamlessly</h1>
      <h2>With ZapišiSi, your ideas are always within reach. Organize, plan, and capture everything that matters.</h2>
    </div>

    <div className='features-section'>
      <h2>Key Features:</h2>
      <div className='feature-cards'>
        <div className='feature-card'>
          <h3>Write notes in real-time</h3>
          <p>Access your notes from anywhere with instant syncing across all your devices.</p>
        </div>
        <div className='feature-card'>
          <h3>Stylish and easy to make notes</h3>
          <p>Be able to take notes effortlessly and get started in no time.</p>
        </div>
        <div className='feature-card'>
          <h3>Collaborative Notes</h3>
          <p>Work together with your team by sharing and editing notes in real-time.</p>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className='footer'>
      <p>ZapišiSi &copy; 2025. All Rights Reserved.</p>
      <div className='footer-links'>
        <Link to="/contact-us">Contact Us</Link>
      </div>
    </footer>
  </div>
);

export default LandingPage;
