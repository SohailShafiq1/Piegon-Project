import React from 'react';
import '../styles/StatsBar.css';
import { stats } from '../data/mockData';

const StatsBar = () => {
  return (
    <div className="stats-container">
      <h2 className="title-urdu">الخاکى پیجن ٹورنامنٹ پیروشاہ 5روزہ</h2>
      <p className="start-time">Start time : 06:00:00</p>
      
      <div className="stats-box">
        <div className="stats-row">
          Lofts: {stats.lofts}, Total pigeons: {stats.totalPigeons}, Pigeons landed: {stats.pigeonsLanded}, Pigeons remaining: {stats.pigeonsRemaining}
        </div>
      </div>

      <div className="last-winner">
        لاسٹ ونر : {stats.lastWinner}
      </div>
    </div>
  );
};

export default StatsBar;
