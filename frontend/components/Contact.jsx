import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Contact.jsx';


const Contact = () => {

    return (
        <div className="contact-container">
            <Link to="/"><img src='../src/home.png' style={{ margin: '10px 0px 0px 10px' }} /></Link>
            <div className="bee-divider">
                <div className="bee-line"></div>
                <div className="bee-hexagon with-image">
                    <img src="assets/images/maja.png" alt="Bee"/>
                </div>
                <div className="bee-line"></div>
            </div>
            <div className="kontakt" id="kontakt">
                <div className="bee-divider">
                    <div className="bee-line"></div>
                    <div className="bee-hexagon"></div>
                    <div className="bee-line"></div>
                </div>
                <form action="https://formspree.io/f/manyznzd" method="POST">
                    <h2>KONTAKT</h2>
                    <label for="ime">Ime:</label> <br/>
                    <input type="text" name="ime" id="ime"/> <br/>
                    <label for="el-naslov">Elektronski naslov:</label> <br/>
                    <input type="email" name="el-naslov" id="el-naslov" required/> <br/>
                    <label for="sporocilo">Sporočilo:</label> <br/>
                    <textarea name="sporocilo" id="sporocilo"></textarea> <br/>
                    <button type="submit">Pošlji!</button>
                </form>
            </div>

            <div className="bee-divider">
                <div className="bee-line"></div>
                <div className="bee-hexagon with-image">
                    <img src="assets/images/maja.png" alt="Bee"/>
                </div>
                <div className="bee-line"></div>
            </div>
        </div>
    ); 
};

export default Contact;
