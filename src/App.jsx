import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { FaLink } from 'react-icons/fa';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import StatsBar from './components/StatsBar';
import DateTabs from './components/DateTabs';
import Leaderboard from './components/Leaderboard';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminDashboard from './Admin Page/AdminDashboard';
import Tournaments from './Admin Page/Tournaments';
import Categories from './Admin Page/Categories';
import News from './Admin Page/News';
import AdminLogin from './Admin Page/AdminLogin';
import ManageAdmins from './Admin Page/ManageAdmins';
import ManageOwners from './Admin Page/ManageOwners';
import GeneralSettings from './Admin Page/GeneralSettings';
import LeagueView from './LeagueView';
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

          // Smart date selection: show current day if flying date, total on break days during tournament
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const flyingDatesArr = active.flyingDates || [];
          let bestIdx = 'total';

          if (flyingDatesArr.length > 0) {
            const firstDate = new Date(flyingDatesArr[0]);
            firstDate.setHours(0, 0, 0, 0);
            
            const lastDate = new Date(flyingDatesArr[flyingDatesArr.length - 1]);
            lastDate.setHours(0, 0, 0, 0);

            // Check if today is a flying date
            for (let i = 0; i < flyingDatesArr.length; i++) {
              const d = new Date(flyingDatesArr[i]);
              d.setHours(0, 0, 0, 0);
              if (today.getTime() === d.getTime()) {
                bestIdx = i;
                break;
              }
            }
            // If not on a flying date but between first and last, show total (break day)
            // Otherwise if before first or after last, also show total
            // bestIdx already defaults to 'total'
          }
          setActiveDateIndex(bestIdx);
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
      <Footer />
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

        // Smart date selection: show current day if flying date, total on break days during tournament
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const flyingDatesArr = data.flyingDates || [];
        let bestIdx = 'total';

        if (flyingDatesArr.length > 0) {
          const firstDate = new Date(flyingDatesArr[0]);
          firstDate.setHours(0, 0, 0, 0);
          
          const lastDate = new Date(flyingDatesArr[flyingDatesArr.length - 1]);
          lastDate.setHours(0, 0, 0, 0);

          // Check if today is a flying date
          for (let i = 0; i < flyingDatesArr.length; i++) {
            const d = new Date(flyingDatesArr[i]);
            d.setHours(0, 0, 0, 0);
            if (today.getTime() === d.getTime()) {
              bestIdx = i;
              break;
            }
          }
          // If not on a flying date but between first and last, show total (break day)
          // Otherwise if before first or after last, also show total
          // bestIdx already defaults to 'total'
        }
        setActiveDateIndex(bestIdx);

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
              {tournament.headline || ` - کوٹلہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز`}
           
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
      <Footer />
    </>
  );
}

const DashboardHome = () => {
  const [stats, setStats] = useState({ tournaments: 0, owners: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-stats">Loading dashboard data...</div>;

  return (
    <>
      <h1>Welcome to Admin Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tournaments</h3>
          <p>{stats.tournaments}</p>
        </div>
        <div className="stat-card">
          <h3>Piegon Owners</h3>
          <p>{stats.owners}</p>
        </div>
        <div className="stat-card">
          <h3>Active Admins</h3>
          <p>{stats.admins}</p>
        </div>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/league/:leagueName" element={<LeagueView />} />
          <Route path="/tournament/:id" element={<TournamentView />} />
          <Route path="/contact" element={
            <>
              <Banner />
              <Navbar />
              <div className="main-content">
                <Contact />
              </div>
              <Footer />
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
            <Route path="settings" element={<GeneralSettings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
