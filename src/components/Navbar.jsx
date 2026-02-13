import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        // Only show tournaments intended for public view
        setTournaments(data.filter(t => t.showOnHome !== false));
      } catch (error) {
        console.error("Error fetching tournaments for navbar:", error);
      }
    };
    fetchTournaments();
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">kotlapigeon</Link>
        <ul className="nav-links">
          {tournaments.length > 0 ? (
            tournaments.map((t) => (
              <li key={t._id}>
                <Link to={`/tournament/${t._id}`}>{t.name}</Link>
              </li>
            ))
          ) : (
            <li><span className="no-tournaments-nav">No Active Clubs</span></li>
          )}
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
