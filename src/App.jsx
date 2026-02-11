import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import StatsBar from './components/StatsBar';
import DateTabs from './components/DateTabs';
import Leaderboard from './components/Leaderboard';
import Contact from './components/Contact';
import './App.css';

function Home({ activeDate, setActiveDate }) {
  return (
    <>
      <div className="announcement">
        کڑیانوالہ پیجن کی جانب سے تمام کھلاڑیوں کو بیسٹ وشز
      </div>
      <StatsBar />
      <DateTabs activeDate={activeDate} onDateChange={setActiveDate} />
      <Leaderboard />
    </>
  );
}

function App() {
  const [activeDate, setActiveDate] = useState('2025-10-07');

  return (
    <Router>
      <div className="app-container">
        <Banner />
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home activeDate={activeDate} setActiveDate={setActiveDate} />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
