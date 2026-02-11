import React from 'react';
import '../styles/DateTabs.css';
import { tournamentDates } from '../data/mockData';

const DateTabs = ({ activeDate, onDateChange }) => {
  return (
    <div className="date-tabs-container">
      <div className="date-tabs">
        {tournamentDates.map((date) => (
          <button
            key={date}
            className={`date-tab ${activeDate === date ? 'active' : ''}`}
            onClick={() => onDateChange(date)}
          >
            {date}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateTabs;
