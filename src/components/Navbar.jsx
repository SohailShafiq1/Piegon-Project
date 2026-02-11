import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const navLinks = [
    "شیران دا دنگل پیجن کلب ٹونیاں",
    "پاک اتحاد کلب ڈھینڈہ شریف",
    "جلالپور جٹاں پیجن کلب",
    "تحصیل لیول کلب",
    "لالہ افضل میموریل پیجن کلب جیندڑ کلاں",
    "سائیں پیجن کلب نگڑیاں",
    "لالہ افضل میموریل پیجن کلب جیندڑ کلاں - 2"
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">karianwalapigeon</Link>
        <ul className="nav-links">
          {navLinks.map((link, index) => (
            <li key={index}><a href="#">{link}</a></li>
          ))}
          <li>
            <Link to="/contact" className="contact-nav-button">Contact</Link>
          </li>
        </ul>
        <div className="current-users">
          Current users: 1
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
