import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
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
  const [activeTournament, setActiveTournament] = useState(null);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        if (data.length > 0) {
          // Find the most recent active tournament
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

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!activeTournament) return (
    <>
      <Banner />
      <Navbar />
      <div className="main-content">
        <div className="no-tournaments">No active tournaments found. Create one in the Admin panel.</div>
      </div>
    </>
  );

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

function TournamentView() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments/${id}`);
        const data = await response.json();
        setTournament(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournament:", error);
        setLoading(false);
      }
    };
    fetchTournament(id);
  }, [id]);

  if (loading) return <div className="loading-screen">Loading Tournament Data...</div>;
  if (!tournament) return <div>Tournament not found</div>;

  const flyingDates = tournament.flyingDates || [];

  return (
    <>
      <Banner />
      <Navbar />
      <div className="main-content">
        <div className="announcement">
          {tournament.name} - کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز
        </div>
        <StatsBar tournament={tournament} />
        <DateTabs 
          dates={flyingDates} 
          activeDateIndex={activeDateIndex} 
          onDateChange={setActiveDateIndex} 
        />
        <Leaderboard 
          tournament={tournament} 
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
          <Route path="/tournament/:id" element={<TournamentView />} />
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
