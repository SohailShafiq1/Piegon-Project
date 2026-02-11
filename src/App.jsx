import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import StatsBar from './components/StatsBar';
import DateTabs from './components/DateTabs';
import Leaderboard from './components/Leaderboard';
import './App.css';

function App() {
  const [activeDate, setActiveDate] = useState('2025-10-07');

  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;
