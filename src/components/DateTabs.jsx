import React from 'react';
import '../styles/DateTabs.css';

const DateTabs = ({ dates = [], activeDateIndex, onDateChange }) => {
  if (!dates || dates.length === 0) return null;

  return (
    <div className="date-tabs-container">
      <div className="date-tabs">
        {dates.map((date, idx) => (
          <button
            key={idx}
            className={`date-tab ${activeDateIndex === idx ? 'active' : ''}`}
            onClick={() => onDateChange(idx)}
          >
            {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </button>
        ))}
        <button
          className={`date-tab total-tab ${activeDateIndex === 'total' ? 'active' : ''}`}
          onClick={() => onDateChange('total')}
        >
          Total
        </button>
      </div>
    </div>
  );
};

export default DateTabs;
