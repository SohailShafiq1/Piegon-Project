import React, { useState } from 'react';
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

function Home({ activeDate, setActiveDate }) {
  return (
    <>
      <Banner />
      <Navbar />
      <div className="main-content">
        <div className="announcement">
          کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز
        </div>
        <StatsBar />
        <DateTabs activeDate={activeDate} onDateChange={setActiveDate} />
        <Leaderboard />
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
  const [activeDate, setActiveDate] = useState('2025-10-07');

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home activeDate={activeDate} setActiveDate={setActiveDate} />} />
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
