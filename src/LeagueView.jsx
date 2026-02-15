import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import Footer from './components/Footer';
import { calculateGrandTotal, calculateGrandTotalSeconds } from './utils/calculations';
import './LeagueView.css';

const LeagueView = () => {
  const { leagueName } = useParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagueTournaments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        // Filter by league name and active status
        const currentView = decodeURIComponent(leagueName);
        const filtered = data.filter(t => {
          const l = t.leagueName || 'Independent';
          if (currentView === 'Independent') {
            return (l === 'Independent' || l === 'General') && t.status === 'Active';
          }
          return l === currentView && t.status === 'Active';
        });
        setTournaments(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching league tournaments:", error);
        setLoading(false);
      }
    };
    fetchLeagueTournaments();
  }, [leagueName]);

  const handleCopyLink = (tournamentId, e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/tournament/${tournamentId}`;
    navigator.clipboard.writeText(url).then(() => {
      const target = e.currentTarget;
      const originalContent = target.innerHTML;
      target.innerHTML = 'Copied!';
      target.classList.add('copied');
      setTimeout(() => {
        target.innerHTML = originalContent;
        target.classList.remove('copied');
      }, 2000);
    });
  };

  const formatPlayerName = (name) => {
    if (!name) return "";
    const words = name.split(/\s+/);
    if (words.length <= 3) return name;
    return words.slice(0, 3).join(' ') + '...';
  };

  if (loading) return <div className="loading-screen">Loading League Data...</div>;

  return (
    <>
      <Banner posters={tournaments[0]?.posters || []} />
      <Navbar />
      <div className="league-container">
        <div className="announcement">
          <marquee behavior="scroll" direction="right">
            کوٹلہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز آف لک اللہ پاک آپ سبکو سلامت رکھے اور کامیاب کرے
          </marquee>
        </div>
        
        <div className="league-content">
          <div className="league-section-banner">
            {decodeURIComponent(leagueName) === 'Independent' ? "Other Independent Tournaments" : decodeURIComponent(leagueName)}
          </div>

          {tournaments.length > 0 ? (
            tournaments.map((t) => (
              <div key={t._id} className="league-tournament-section">
                <div className="league-tournament-body">
                  <div className="league-tournament-right">
                    <div className="league-tournament-info">
                      <Link to={`/tournament/${t._id}`} style={{ textDecoration: 'none' }}>
                        <h3 className="tournament-name-blue">{t.name}</h3>
                      </Link>
                      <p className="tournament-dates-mini">
                        {new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - 
                        {new Date(t.flyingDates?.[t.flyingDates.length - 1] || t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="league-table-container">
                      <table className="league-standing-table">
                        <thead>
                          <tr>
                            <th className="pos-cell">Pos</th>
                            <th className="photo-cell">Photo</th>
                            <th className="name-cell-header">Name</th>
                            <th className="city-cell">City</th>
                            <th className="total-cell-header">Total</th>
                            <th className="prize-cell">Prize</th>
                          </tr>
                        </thead>
                        <tbody>
                          {t.participants && t.participants.length > 0 ? (
                            [...t.participants]
                              .sort((a, b) => {
                                const aSecs = calculateGrandTotalSeconds(a.pigeonTimes, t.numPigeons, t.startTime, t.numDays, t.numPigeons);
                                const bSecs = calculateGrandTotalSeconds(b.pigeonTimes, t.numPigeons, t.startTime, t.numDays, t.numPigeons);
                                return bSecs - aSecs;
                              })
                              .slice(0, 7)
                              .map((p, idx) => (
                                <tr key={idx}>
                                  <td className="pos-cell">{idx + 1}</td>
                                  <td className="photo-cell">
                                    <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} alt="" />
                                  </td>
                                  <td className="name-cell-urdu">{p.name}</td>
                                  <td className="city-cell">{p.address || '-'}</td>
                                  <td className="total-cell-bold">
                                    {calculateGrandTotal(p.pigeonTimes, t.numPigeons, t.startTime, t.numDays, t.numPigeons)}
                                  </td>
                                  <td className="prize-cell"></td>
                                </tr>
                              ))
                          ) : (
                            <tr>
                              <td colSpan="6" className="no-data">No participants</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="league-tournament-section" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ color: '#2d3748', marginBottom: '10px' }}>No Active Tournaments</h3>
              <p style={{ color: '#718096' }}>There are currently no active tournaments listed under this league. Please check back later.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LeagueView;
