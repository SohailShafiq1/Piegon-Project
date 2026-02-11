import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const navLinks = [
    "شیران دا دنگل پیجن کلب ٹونیاں",
    "پاک اتحاد کلب ڈھینڈہ شریف",
    "جلالپور جٹاں پیجن کلب",
    "تحصیل لیول کلب",
    "لالہ افضل میموریل پیجن کلب جیندڑ کلاں",
    "سائیں پیجن کلب نگڑیاں",
    "لالہ افضل میموریل پیجن کلب جیندڑ کلاں - 2",
    "Contact"
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">karianwalapigeon</div>
        <ul className="nav-links">
          {navLinks.map((link, index) => (
            <li key={index}><a href="#">{link}</a></li>
          ))}
        </ul>
        <div className="current-users">
          Current users: 1
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
