import React from 'react';
import '../styles/Leaderboard.css';
import { 
  calculateTotalTime, 
  calculateGrandTotal, 
  calculateWinners, 
  calculateTotalSeconds, 
  calculateGrandTotalSeconds 
} from '../utils/calculations';

const Leaderboard = ({ tournament, dateIndex }) => {
  if (!tournament) return null;

  const { participants = [], startTime, numPigeons, helperPigeons, numDays } = tournament;
  const pigeonsPerDay = (numPigeons || 0) + (helperPigeons || 0);

  // Helper to strip seconds from HH:MM:SS strings
  const formatDisplayTime = (timeStr) => {
    if (!timeStr || timeStr === '-') return '-';
    const parts = timeStr.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  };

  // Sorting: If total view, sort by Grand Total Seconds. If day view, sort by Daily Total Seconds.
  const sortedParticipants = [...participants].sort((a, b) => {
    let aSecs, bSecs;
    if (dateIndex === 'total') {
      aSecs = calculateGrandTotalSeconds(a.pigeonTimes, pigeonsPerDay, startTime, numDays, numPigeons);
      bSecs = calculateGrandTotalSeconds(b.pigeonTimes, pigeonsPerDay, startTime, numDays, numPigeons);
    } else {
      const aDayTimes = (a.pigeonTimes || []).slice(dateIndex * pigeonsPerDay, (dateIndex + 1) * pigeonsPerDay);
      const bDayTimes = (b.pigeonTimes || []).slice(dateIndex * pigeonsPerDay, (dateIndex + 1) * pigeonsPerDay);
      aSecs = calculateTotalSeconds(startTime, aDayTimes, numPigeons);
      bSecs = calculateTotalSeconds(startTime, bDayTimes, numPigeons);
    }
    // Sort descending (longer time is better)
    return bSecs - aSecs;
  });

  const winners = calculateWinners(participants, startTime, dateIndex, pigeonsPerDay);

  return (
    <div className="leaderboard-container">
      {(winners.firstWinner || winners.lastWinner) && (
        <div className="winners-banner">
          {winners.firstWinner && (
            <div className="winner-tag first">
              <span className="label">{dateIndex === 'total' ? 'Overall First Winner' : `Day ${dateIndex + 1} First Winner`}</span>
              <span className="name">{winners.firstWinner}</span>
            </div>
          )}
          {winners.lastWinner && (
            <div className="winner-tag last">
              <span className="label">{dateIndex === 'total' ? 'Overall Last Winner' : `Day ${dateIndex + 1} Last Winner`}</span>
              <span className="name">{winners.lastWinner}</span>
            </div>
          )}
        </div>
      )}

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
                {dateIndex !== 'total' && <td>{formatDisplayTime(startTime)}</td>}
                {dateIndex !== 'total' ? (
                  [...Array(pigeonsPerDay)].map((_, pIdx) => {
                    const time = p.pigeonTimes[dateIndex * pigeonsPerDay + pIdx];
                    return <td key={pIdx}>{formatDisplayTime(time)}</td>;
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
