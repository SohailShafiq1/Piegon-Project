import React from 'react';
import '../styles/Leaderboard.css';
import { leaderboardData } from '../data/mockData';

const Leaderboard = () => {
  return (
    <div className="leaderboard-container">
      <div className="table-responsive">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Name</th>
              <th>Start Time</th>
              <th>pigeon 1</th>
              <th>pigeon 2</th>
              <th>pigeon 3</th>
              <th>pigeon 4</th>
              <th>pigeon 5</th>
              <th>pigeon 6</th>
              <th>pigeon 7</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((row) => (
              <tr key={row.sr}>
                <td>{row.sr}</td>
                <td className="name-cell">{row.name}</td>
                <td>{row.startTime}</td>
                {row.pigeons.map((time, idx) => (
                  <td key={idx}>{time}</td>
                ))}
                <td className="total-cell">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
