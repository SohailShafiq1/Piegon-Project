import React from 'react';
import '../styles/StatsBar.css';

const StatsBar = ({ tournament }) => {
  if (!tournament) return null;

  const lofts = tournament.participants?.length || 0;
  const numPigeons = tournament.numPigeons || 0;
  const helperPigeons = tournament.helperPigeons || 0;
  const totalPigeonsPerDay = numPigeons + helperPigeons;
  const totalPigeons = lofts * totalPigeonsPerDay;

  // Calculate pigeons landed across all participants
  const landedCount = (tournament.participants || []).reduce((acc, p) => {
    return acc + (p.pigeonTimes || []).filter(t => t && t !== '').length;
  }, 0);

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
  };

  return (
    <div className="stats-container">
      <h2 className="title-urdu">{tournament.name}</h2>
      <p className="start-time">Start time : {formatDisplayTime(tournament.startTime)}</p>
      
      <div className="stats-box">
        <div className="stats-row">
          Lofts: {lofts}, Total pigeons: {totalPigeons}, Pigeons landed: {landedCount}, Pigeons remaining: {totalPigeons - landedCount}
        </div>
      </div>

      <div className="last-winner">
        لاسٹ ونر : {tournament.lastWinner || 'N/A'}
      </div>
    </div>
  );
};

export default StatsBar;
