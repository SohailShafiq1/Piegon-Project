import React from 'react';
import '../styles/StatsBar.css';

const StatsBar = ({ tournament, dateIndex }) => {
  if (!tournament) return null;

  const participants = tournament.participants || [];
  const numPigeons = tournament.numPigeons || 0;
  const helperPigeons = tournament.helperPigeons || 0;
  const totalPigeonsPerDay = numPigeons + helperPigeons;
  const totalDays = tournament.numDays || 1;

  let totalPigeonsCount = 0;
  let landedCount = 0;
  let loftCount = 0;
  let remainingCount = 0;

  // Determine what the "Current Day" is for Loft/Remaining logic
  // If we are looking at Day 2, then Day 1 is "past", Day 2 is "today", Day 3+ is "future"
  // If we are looking at 'total', we'll treat the "latest day with any data" as the current day
  let effectiveCurrentDay = typeof dateIndex === 'number' ? dateIndex : 0;
  if (dateIndex === 'total') {
    // Find the latest day that has any time entered
    for (let d = totalDays - 1; d >= 0; d--) {
      const hasData = participants.some(p => {
        const dayTimes = (p.pigeonTimes || []).slice(d * totalPigeonsPerDay, (d + 1) * totalPigeonsPerDay);
        return dayTimes.some(t => t && t.trim() !== '' && t !== '-');
      });
      if (hasData) {
        effectiveCurrentDay = d;
        break;
      }
    }
  }

  participants.forEach(p => {
    const times = p.pigeonTimes || [];
    
    for (let i = 0; i < numPigeons; i++) {
      // For each pigeon, we track its status relative to effectiveCurrentDay
      let pigeonLandedToday = false;
      let pigeonLoftedInPast = false;
      
      // Check previous days for Lofts
      for (let prevD = 0; prevD < effectiveCurrentDay; prevD++) {
        const t = times[prevD * totalPigeonsPerDay + i];
        if (!t || t.trim() === '' || t === '-') {
          pigeonLoftedInPast = true;
          break;
        }
      }

      if (pigeonLoftedInPast) {
        loftCount++;
      } else {
        // Not lofted in past, check today
        const tToday = times[effectiveCurrentDay * totalPigeonsPerDay + i];
        if (tToday && tToday.trim() !== '' && tToday !== '-') {
          landedCount++;
        } else {
          remainingCount++;
        }
      }
    }
  });

  // Total pigeons is just the sum of these three for the current observation window
  totalPigeonsCount = landedCount + loftCount + remainingCount;

  // If in 'total' view, user might want the sum of ALL pigeons across ALL days?
  // "total pigeons overall of tournament" 
  // Let's adjust totalPigeonsCount if in 'total' view to show the grand sum
  if (dateIndex === 'total') {
    totalPigeonsCount = participants.length * numPigeons * totalDays;
    // And let's redefine landed/loft for the entire tournament duration
    let totalLanded = 0;
    participants.forEach(p => {
      totalLanded += (p.pigeonTimes || []).filter((t, idx) => {
        const pIdx = idx % totalPigeonsPerDay;
        // Only count pigeons that are not helpers
        return pIdx < numPigeons && t && t.trim() !== '' && t !== '-';
      }).length;
    });
    landedCount = totalLanded;
    // For 'total' view, remaining/loft becomes a bit aggregate
    remainingCount = totalPigeonsCount - landedCount; 
    loftCount = 0; // In total view, we usually don't distinguish loft from remaining easily
  }

  // Statistical Logic Summary:
  // Landed: Counted based on assigned times for the observed day.
  // Lofts: Pigeons missing time on any day before today.
  // Remaining: Pigeons active today but not yet landed.
  // Total: Sum of the above.

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
          Lofts: {loftCount}, Total pigeons: {totalPigeonsCount}, Pigeons landed: {landedCount}, Pigeons remaining: {remainingCount}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
