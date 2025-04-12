import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.css';

const Contact = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState('');



  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    let valid = true;

    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      valid = false;
    } else {
      setEmailError('');
    }

    if (valid) {
      event.target.submit();
    }
  };

  return (
    <div className="contact-container">
      <Link to="/"><img src='../src/home.png' style={{ margin: '10px 0px 0px 10px' }} /></Link>
      <div className="bee-divider">
        <div className="bee-line"></div>
        <div className="bee-hexagon with-image">
          <img src="../src/zobobovec.png" height="5px" width="5px"alt="Pis"/>
        </div>
        <div className="bee-line"></div>
      </div>
      <div className="kontakt" id="kontakt">
        <div className="bee-divider">
          <div className="bee-line"></div>
          <div className="bee-hexagon"></div>
          <div className="bee-line"></div>
        </div>
        <form action="https://formspree.io/f/manyznzd" method="POST" onSubmit={handleSubmit}>
          <h2>CONTACT</h2>
          <label htmlFor="ime">Name:</label> <br/>
          <input
            type="text"
            name="ime"
            id="ime"
            required
          /> <br/>
          <label htmlFor="el-naslov">Email:</label> <br/>
          <input
            type="email"
            name="el-naslov"
            id="el-naslov"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          /> <br/>
          {emailError && <p className="error">{emailError}</p>}
          <label htmlFor="sporocilo">Message:</label> <br/>
          <textarea
            name="sporocilo"
            id="sporocilo"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea> <br/>
          <button type="submit">Send!</button>
        </form>
      </div>
      <div className="bee-divider">
        <div className="bee-line"></div>
        <div className="bee-hexagon with-image">
          <img src="../src/zobobovec.png" alt="Pis"/>
        </div>
        <div className="bee-line"></div>
      </div>
    </div>
  );
};

export default Contact;
