import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

const Navbar = () => {
  const [leagues, setLeagues] = useState([]);
  const [hasIndependent, setHasIndependent] = useState(false);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        // Filter active tournaments
        const activeTournaments = data.filter(t => t.status === 'Active' && t.showOnHome !== false);
        
        // Find leagues (excluding Independent)
        const leagueSet = new Set();
        let independentFound = false;

        activeTournaments.forEach(t => {
          const lName = t.leagueName || 'Independent';
          if (lName === 'Independent' || lName === 'General') {
            independentFound = true;
          } else {
            leagueSet.add(lName);
          }
        });

        setLeagues(Array.from(leagueSet));
        setHasIndependent(independentFound);
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
          {leagues.map((league) => (
            <li key={league}>
              <Link to={`/league/${encodeURIComponent(league)}`}>{league}</Link>
            </li>
          ))}
          
          {hasIndependent && (
            <li>
              <Link to="/league/Independent">Others</Link>
            </li>
          )}

          {!leagues.length && !hasIndependent && (
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
