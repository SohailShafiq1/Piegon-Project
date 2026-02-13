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
import Categories from './Admin Page/Categories';
import News from './Admin Page/News';
import AdminLogin from './Admin Page/AdminLogin';
import ManageAdmins from './Admin Page/ManageAdmins';
import ManageOwners from './Admin Page/ManageOwners';
import './App.css';

function Home() {
  const [activeTournament, setActiveTournament] = useState(null);
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News for broadcast
        try {
          const newsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/news`);
          const newsData = await newsRes.json();
          setNewsList(newsData.filter(n => n.status === 'Published'));
        } catch (e) {
          console.error("News fetch error:", e);
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
        const data = await response.json();
        if (data.length > 0) {
          // Find the most recent active tournament
          const active = data.find(t => t.status === 'Active') || data[0];
          setActiveTournament(active);

          // Default to the last date that has entered data
          const pigeonsPerDay = (active.numPigeons || 0) + (active.helperPigeons || 0);
          const numDays = active.flyingDates?.length || 0;
          let lastActiveIdx = 0;
          for (let d = numDays - 1; d >= 0; d--) {
            const hasData = (active.participants || []).some(p => {
              const dayTimes = (p.pigeonTimes || []).slice(d * pigeonsPerDay, (d + 1) * pigeonsPerDay);
              return dayTimes.some(t => t && t.trim() !== '');
            });
            if (hasData) {
              lastActiveIdx = d;
              break;
            }
          }
          setActiveDateIndex(lastActiveIdx);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!activeTournament) return (
    <>
      <Banner posters={[]} />
      <Navbar />
      <div className="main-content">
        <div className="no-tournaments">No active tournaments found. Create one in the Admin panel.</div>
      </div>
    </>
  );

  const flyingDates = activeTournament.flyingDates || [];

  return (
    <>
      <Banner posters={activeTournament.posters} />
      <Navbar />
      <div className="main-content">
        <div className="announcement">
          <marquee behavior="scroll" direction="right">
            {activeTournament.headline || `${activeTournament.name} - کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز`}
            {newsList.map(news => (
               <span key={news._id} style={{ marginLeft: '100px' }}>
                 {news.title}: {news.content}
               </span>
            ))}
          </marquee>
        </div>
        <StatsBar tournament={activeTournament} dateIndex={activeDateIndex} />
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
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch News for broadcast
        try {
          const newsRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/news`);
          const newsData = await newsRes.json();
          setNewsList(newsData.filter(n => n.status === 'Published'));
        } catch (e) {
          console.error("News fetch error:", e);
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments/${id}`);
        const data = await response.json();
        setTournament(data);

        // Default to the last date that has entered data
        const pigeonsPerDay = (data.numPigeons || 0) + (data.helperPigeons || 0);
        const numDays = data.flyingDates?.length || 0;
        let lastActiveIdx = 0;
        for (let d = numDays - 1; d >= 0; d--) {
          const hasData = (data.participants || []).some(p => {
            const dayTimes = (p.pigeonTimes || []).slice(d * pigeonsPerDay, (d + 1) * pigeonsPerDay);
            return dayTimes.some(t => t && t.trim() !== '');
          });
          if (hasData) {
            lastActiveIdx = d;
            break;
          }
        }
        setActiveDateIndex(lastActiveIdx);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournament:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="loading-screen">Loading Tournament Data...</div>;
  if (!tournament) return <div>Tournament not found</div>;

  const flyingDates = tournament.flyingDates || [];

  return (
    <>
      <Banner posters={tournament.posters} />
      <Navbar />
      <div className="main-content">
        <div className="announcement">
          <marquee behavior="scroll" direction="right">
            {tournament.headline || `${tournament.name} - کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز`}
            {newsList.map(news => (
               <span key={news._id} style={{ marginLeft: '100px' }}>
                 {news.title}: {news.content}
               </span>
            ))}
          </marquee>
        </div>
        <StatsBar tournament={tournament} dateIndex={activeDateIndex} />
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
            <Route path="categories" element={<Categories />} />
            <Route path="owners" element={<ManageOwners />} />
            <Route path="news" element={<News />} />
            <Route path="users" element={<ManageAdmins />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
