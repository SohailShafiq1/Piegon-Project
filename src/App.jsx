import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import StatsBar from './components/StatsBar';
import DateTabs from './components/DateTabs';
import Leaderboard from './components/Leaderboard';
import Contact from './components/Contact';
import AdminDashboard from './Admin Page/AdminDashboard';
import Tournaments from './Admin Page/Tournaments';
import AdminLogin from './Admin Page/AdminLogin';
import ManageAdmins from './Admin Page/ManageAdmins';
import './App.css';

function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTournament, setActiveTournament] = useState(null);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        setTournaments(data);
        if (data.length > 0) {
          // Find the most recent active tournament or just the first one
          const active = data.find(t => t.status === 'Active') || data[0];
          setActiveTournament(active);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  if (loading) return <div className="loading-screen">Loading Tournament...</div>;
  if (!activeTournament) return <div className="no-tournaments">No active tournaments found.</div>;

  const flyingDates = activeTournament.flyingDates || [];

  return (
    <>
      <Banner />
      <Navbar />
      <div className="main-content">
        <div className="announcement">
          {activeTournament.name} - کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز
        </div>
        <StatsBar tournament={activeTournament} />
        <DateTabs 
          dates={flyingDates} 
          activeDateIndex={activeDateIndex} 
          onDateChange={setActiveDateIndex} 
        />
        <Leaderboard 
          tournament={activeTournament} 
          dateIndex={activeDateIndex} 
        />
      </div>
    </>
  );
}

const DashboardHome = () => (
  <>
    <h1>Welcome to Admin Dashboard</h1>
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Tournaments</h3>
        <p>12</p>
      </div>
      <div className="stat-card">
        <h3>Piegon Owners</h3>
        <p>45</p>
      </div>
      <div className="stat-card">
        <h3>Active Admins</h3>
        <p>3</p>
      </div>
    </div>
  </>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={
            <>
              <Banner />
              <Navbar />
              <div className="main-content">
                <Contact />
              </div>
            </>
          } />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="categories" element={<div>Categories Page (Coming Soon)</div>} />
            <Route path="owners" element={<div>Piegon Owners Page (Coming Soon)</div>} />
            <Route path="news" element={<div>News Page (Coming Soon)</div>} />
            <Route path="users" element={<ManageAdmins />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
