import React from 'react';
import '../styles/Leaderboard.css';
import { calculateTotalTime, calculateGrandTotal, calculateWinners } from '../utils/calculations';

const Leaderboard = ({ tournament, dateIndex }) => {
  if (!tournament) return null;

  const { participants = [], startTime, numPigeons, helperPigeons, numDays } = tournament;
  const pigeonsPerDay = (numPigeons || 0) + (helperPigeons || 0);

  // Sorting: If total view, sort by Grand Total. If day view, sort by Daily Total.
  const sortedParticipants = [...participants].sort((a, b) => {
    let aTime, bTime;
    if (dateIndex === 'total') {
      aTime = calculateGrandTotal(a.pigeonTimes, pigeonsPerDay, startTime, numDays, numPigeons);
      bTime = calculateGrandTotal(b.pigeonTimes, pigeonsPerDay, startTime, numDays, numPigeons);
    } else {
      const aDayTimes = (a.pigeonTimes || []).slice(dateIndex * pigeonsPerDay, (dateIndex + 1) * pigeonsPerDay);
      const bDayTimes = (b.pigeonTimes || []).slice(dateIndex * pigeonsPerDay, (dateIndex + 1) * pigeonsPerDay);
      aTime = calculateTotalTime(startTime, aDayTimes, numPigeons);
      bTime = calculateTotalTime(startTime, bDayTimes, numPigeons);
    }
    // Sort descending (longer time is better)
    return bTime.localeCompare(aTime);
  });

  const winners = calculateWinners(participants, startTime, dateIndex, pigeonsPerDay);

  return (
    <div className="leaderboard-container">
      {winners.firstWinner || winners.lastWinner ? (
        <div className="winners-banner">
          {winners.firstWinner && (
            <div className="winner-tag first">
              <span className="label">{dateIndex === 'total' ? 'Overall First Winner' : `Day ${dateIndex + 1} First Winner`}:</span>
              <span className="name">{winners.firstWinner}</span>
            </div>
          )}
          {winners.lastWinner && (
            <div className="winner-tag last">
              <span className="label">{dateIndex === 'total' ? 'Overall Last Winner' : `Day ${dateIndex + 1} Last Winner`}:</span>
              <span className="name">{winners.lastWinner}</span>
            </div>
          )}
        </div>
      ) : null}

      <div className="table-responsive">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Name</th>
              {dateIndex !== 'total' && <th>Start</th>}
              {dateIndex !== 'total' ? (
                [...Array(pigeonsPerDay)].map((_, i) => (
                  <th key={i}>P{i + 1}</th>
                ))
              ) : (
                tournament.flyingDates.map((_, idx) => (
                   <th key={idx}>Day {idx + 1}</th>
                ))
              )}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sortedParticipants.map((p, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td className="name-cell">
                   <div className="player-info">
                     <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} alt="" className="player-img" />
                     <span>{p.name}</span>
                   </div>
                </td>
                {dateIndex !== 'total' && <td>{startTime}</td>}
                {dateIndex !== 'total' ? (
                  [...Array(pigeonsPerDay)].map((_, pIdx) => {
                    const time = p.pigeonTimes[dateIndex * pigeonsPerDay + pIdx];
                    return <td key={pIdx}>{time || '-'}</td>;
                  })
                ) : (
                  tournament.flyingDates.map((_, dIdx) => (
                    <td key={dIdx}>
                      {calculateTotalTime(startTime, p.pigeonTimes.slice(dIdx * pigeonsPerDay, (dIdx + 1) * pigeonsPerDay), numPigeons)}
                    </td>
                  ))
                )}
                <td className="total-cell">
                  {dateIndex === 'total' 
                    ? calculateGrandTotal(p.pigeonTimes, pigeonsPerDay, startTime, numDays, numPigeons)
                    : calculateTotalTime(startTime, p.pigeonTimes.slice(dateIndex * pigeonsPerDay, (dateIndex + 1) * pigeonsPerDay), numPigeons)
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
