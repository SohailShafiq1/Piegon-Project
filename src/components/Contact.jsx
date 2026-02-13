import React from 'react';
import { FaWhatsapp, FaFacebook } from 'react-icons/fa';
import '../styles/Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p>Connect with us on social media</p>
        <div className="social-links">
          <a href="https://wa.me/YOUR_NUMBER" target="_blank" rel="noopener noreferrer" className="social-button whatsapp">
            <FaWhatsapp />
            <span>WhatsApp</span>
          </a>
          <a href="https://facebook.com/YOUR_PAGE" target="_blank" rel="noopener noreferrer" className="social-button facebook">
            <FaFacebook />
            <span>Facebook</span>
          </a>
        </div>
        <button className="back-button" onClick={() => window.history.back()}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Contact;
