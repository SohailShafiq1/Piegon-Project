import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaUserShield, FaArrowLeft, FaSave, FaTrash, FaImage, FaCalendarAlt, FaClock, FaDove, FaUserPlus, FaUserFriends, FaEdit, FaUsers, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import Modal from '../components/Modal';
import '../styles/Modal.css';
import './Tournaments.css';
import { calculateTotalTime, calculateGrandTotal, calculateWinners } from '../utils/calculations';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', onConfirm: null, confirmText: 'OK' });

  const currentUser = JSON.parse(localStorage.getItem('adminUser'));

  const initialFormState = {
    name: '',
    admin: currentUser?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    numDays: 1,
    numPigeons: 0,
    noteTimePigeons: 0,
    helperPigeons: 0,
    status: 'Upcoming',
    showOnHome: true,
    posters: [],
    participants: [],
    firstWinner: '',
    lastWinner: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newParticipant, setNewParticipant] = useState({ name: '', image: '', address: '', phone: '' });
  const [showParticipantForm, setShowParticipantForm] = useState(false);
  const [participantModalOpen, setParticipantModalOpen] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(0); // 0 to numDays-1, or 'total'

  const handleTimeChange = (participantIndex, pigeonIndex, value) => {
    // deep copy the participants array and the specific participant object to avoid mutation
    const updatedParticipants = [...formData.participants];
    const updatedParticipant = { 
      ...updatedParticipants[participantIndex],
      pigeonTimes: [...(updatedParticipants[participantIndex].pigeonTimes || [])]
    };
    
    // Set the new time
    updatedParticipant.pigeonTimes[pigeonIndex] = value;
    
    // Recalculate grand total time
    updatedParticipant.totalTime = calculateGrandTotal(
      updatedParticipant.pigeonTimes,
      (formData.numPigeons || 0) + (formData.helperPigeons || 0),
      formData.startTime,
      formData.numDays || 1,
      formData.numPigeons || 0
    );

    // Update the participant in the array
    updatedParticipants[participantIndex] = updatedParticipant;

    // Recalculate First and Last Winners
    const { firstWinner, lastWinner } = calculateWinners(updatedParticipants, formData.startTime);

    setFormData({ 
      ...formData, 
      participants: updatedParticipants,
      firstWinner,
      lastWinner
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewParticipant({ ...newParticipant, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddParticipant = async () => {
    if (!newParticipant.name) {
      setModalContent({
        title: 'Validation Error',
        message: 'Participant name is required',
        onConfirm: null
      });
      setModalOpen(true);
      return;
    }

    const updatedParticipants = [...(formData.participants || []), newParticipant];
    const updatedFormData = { ...formData, participants: updatedParticipants };

    // Update local state
    setFormData(updatedFormData);
    setNewParticipant({ name: '', image: '', address: '', phone: '' });
    setParticipantModalOpen(false);

    // If editing, save immediately
    if (selectedTournament) {
      const token = localStorage.getItem('adminToken');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments/${selectedTournament._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          const data = await response.json();
          setSelectedTournament(data);
          fetchTournaments();
        } else {
          console.error("Failed to auto-save participant");
        }
      } catch (error) {
        console.error("Error auto-saving participant:", error);
      }
    }
  };

  const removeParticipant = async (index) => {
    const newParticipants = [...formData.participants];
    newParticipants.splice(index, 1);
    const updatedFormData = { ...formData, participants: newParticipants };
    setFormData(updatedFormData);

    // If editing, save immediately
    if (selectedTournament) {
      const token = localStorage.getItem('adminToken');
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments/${selectedTournament._id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedFormData),
        });
        fetchTournaments();
      } catch (error) {
        console.error("Error auto-saving on remove:", error);
      }
    }
  };

  useEffect(() => {
    fetchTournaments();
    if (currentUser?.role === 'Super Admin') {
      fetchAdmins();
    }
  }, []);

  const fetchTournaments = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      // Sort tournaments: User's assigned tournaments first
      const sortedTournaments = [...data].sort((a, b) => {
        const isAAdmin = (a.admin?._id || a.admin) === currentUser?.id;
        const isBAdmin = (b.admin?._id || b.admin) === currentUser?.id;
        if (isAAdmin && !isBAdmin) return -1;
        if (!isAAdmin && isBAdmin) return 1;
        return 0;
      });

      setTournaments(sortedTournaments);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 401 || response.status === 403) {
        // Handle unauthorized
        return;
      }
      if (response.status === 404) {
        setAdmins([{ id: 1, name: "Super Admin" }, { id: 2, name: "Admin 1" }]);
        return;
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const handleEdit = (t) => {
    const isAssignedAdmin = (t.admin?._id || t.admin) === currentUser?.id;
    const isSuperAdmin = currentUser?.role === 'Super Admin';

    if (!isAssignedAdmin && !isSuperAdmin) {
      setModalContent({
        title: 'Access Denied',
        message: 'You are not an admin for this tournament.',
        onConfirm: null
      });
      setModalOpen(true);
      return;
    }

    setSelectedTournament(t);
    setFormData({
      ...initialFormState,
      ...t,
      admin: t.admin?._id || t.admin,
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      posters: t.posters || [],
      participants: t.participants || [],
      firstWinner: t.firstWinner || '',
      lastWinner: t.lastWinner || ''
    });
    setView('edit');
  };

  const handleCreateNew = () => {
    setSelectedTournament(null);
    setFormData(initialFormState);
    setView('edit');
  };

  const handleSave = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    setModalContent({
      title: 'Confirm Save',
      message: 'Are you sure you want to save these changes?',
      confirmText: 'Save Now',
      onConfirm: () => performSave()
    });
    setModalOpen(true);
  };

  const performSave = async () => {
    if (formData.noteTimePigeons > formData.numPigeons) {
      setModalContent({
        title: 'Validation Error',
        message: 'Note time pigeons cannot be greater than the number of flying pigeons',
        onConfirm: null
      });
      setModalOpen(true);
      return;
    }

    // Calculate skipping dates (1, 3, 5...)
    const flyingDates = [];
    const start = new Date(formData.startDate);
    for (let i = 0; i < formData.numDays; i++) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + (i * 2));
        flyingDates.push(nextDate);
    }

    const totalPigeonsPerDay = (formData.numPigeons || 0) + (formData.helperPigeons || 0);
    const updatedParticipants = (formData.participants || []).map(p => ({
        ...p,
        totalTime: calculateGrandTotal(p.pigeonTimes, totalPigeonsPerDay, formData.startTime, formData.numDays || 1, formData.numPigeons || 0)
    }));

    // Recalculate winners one last time before saving
    const { firstWinner, lastWinner } = calculateWinners(updatedParticipants, formData.startTime);

    // Calculate daily winners for each date
    const dailyWinners = flyingDates.map((date, idx) => {
      const winners = calculateWinners(updatedParticipants, formData.startTime, idx, totalPigeonsPerDay);
      return {
        date,
        firstWinner: winners.firstWinner,
        lastWinner: winners.lastWinner
      };
    });

    const tournamentToSave = {
        ...formData,
        participants: updatedParticipants,
        firstWinner,
        lastWinner,
        dailyWinners,
        totalPigeons: totalPigeonsPerDay,
        flyingDates
    };

    const method = selectedTournament ? 'PUT' : 'POST';
    const url = selectedTournament 
      ? `${import.meta.env.VITE_API_BASE_URL}/tournaments/${selectedTournament._id}`
      : `${import.meta.env.VITE_API_BASE_URL}/tournaments`;
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tournamentToSave),
      });

      if (response.ok) {
        const savedTournament = await response.json();
        
        // If we were creating, we might want to go to list, 
        // but user asked to remain on screen.
        // Update selectedTournament so subsequent saves work correctly
        setSelectedTournament(savedTournament);
        // Also update formData in case backend modified anything
        setFormData(prev => ({
          ...prev,
          ...savedTournament,
          startDate: savedTournament.startDate ? new Date(savedTournament.startDate).toISOString().split('T')[0] : prev.startDate,
          admin: savedTournament.admin?._id || savedTournament.admin
        }));
        
        fetchTournaments();
        
        setModalContent({
          title: 'Success',
          message: 'Tournament data saved successfully!',
          onConfirm: null
        });
        setModalOpen(true);
      } else {
        // Handle non-JSON error responses (like 413 Payload Too Large HTML)
        const contentType = response.headers.get("content-type");
        let errorMessage = 'Failed to save tournament';

        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else if (response.status === 413) {
          errorMessage = 'The data is too large to save (images might be too big).';
        }

        console.error("Server error:", errorMessage);
        setModalContent({
            title: 'Error',
            message: errorMessage,
            onConfirm: null
        });
        setModalOpen(true);
      }
    } catch (error) {
      console.error("Error saving tournament:", error);
      setModalContent({
        title: 'Network Error',
        message: 'Could not connect to the server.',
        onConfirm: null
      });
      setModalOpen(true);
    }
  };

  const handleDelete = () => {
    setModalContent({
      title: 'Confirm Delete',
      message: 'Are you sure you want to permanently delete this tournament? This action cannot be undone.',
      confirmText: 'Delete Forever',
      onConfirm: () => performDelete()
    });
    setModalOpen(true);
  };

  const performDelete = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments/${selectedTournament._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setView('list');
        fetchTournaments();
      }
    } catch (error) {
      console.error("Error deleting tournament:", error);
    }
  };

  if (loading) return <div>Loading Tournaments...</div>;

  const renderView = () => {
    if (view === 'time-entry') {
      const totalPigeonsPerDay = (formData.numPigeons || 0) + (formData.helperPigeons || 0);
      const flyingDates = formData.flyingDates || [];
  
      return (
        <div className="time-entry-view">
          <div className="view-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => setView('edit')}><FaArrowLeft /> Back to Edit</button>
              <div className="header-text-mini">
                <h2>Pigeon Landing Times</h2>
                <p>{formData.name}</p>
              </div>
            </div>
            <button className="save-btn" onClick={handleSave}>
              <FaSave /> Save All Times
            </button>
          </div>

          <div className="date-tabs-container">
            {flyingDates.map((date, idx) => (
              <button 
                key={idx} 
                className={`date-tab ${activeDateIndex === idx ? 'active' : ''}`}
                onClick={() => setActiveDateIndex(idx)}
              >
                {new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </button>
            ))}
            <button 
              className={`date-tab total-tab ${activeDateIndex === 'total' ? 'active' : ''}`}
              onClick={() => setActiveDateIndex('total')}
            >
              Tournament Summary
            </button>
          </div>

          {(() => {
            const winners = calculateWinners(formData.participants, formData.startTime, activeDateIndex, totalPigeonsPerDay);
            if (!winners.firstWinner && !winners.lastWinner) return null;

            return (
              <div className="winners-snapshot">
                {winners.firstWinner && (
                  <div className="winner-badge first">
                    <span className="label">
                      {activeDateIndex === 'total' ? 'Overall First Winner:' : `Day ${activeDateIndex + 1} First Winner:`}
                    </span>
                    <span className="name">{winners.firstWinner}</span>
                  </div>
                )}
                {winners.lastWinner && (
                  <div className="winner-badge last">
                    <span className="label">
                      {activeDateIndex === 'total' ? 'Overall Last Winner:' : `Day ${activeDateIndex + 1} Last Winner:`}
                    </span>
                    <span className="name">{winners.lastWinner}</span>
                  </div>
                )}
              </div>
            );
          })()}
  
          <div className="table-responsive">
            <table className="time-table">
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Name</th>
                  {activeDateIndex !== 'total' && <th>Start Time</th>}
                  {activeDateIndex === 'total' ? (
                    flyingDates.map((date, idx) => (
                      <th key={idx}>{new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</th>
                    ))
                  ) : (
                    [...Array(totalPigeonsPerDay)].map((_, i) => (
                      <th key={i} className={i < (formData.helperPigeons || 0) ? 'helper-header' : ''}>
                        pigeon {i + 1}
                        {i < (formData.helperPigeons || 0) && <div className="helper-badge">Helper</div>}
                      </th>
                    ))
                  )}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {formData.participants && formData.participants.length > 0 ? (
                  formData.participants.map((p, pIndex) => (
                    <tr key={pIndex}>
                      <td className="sr-cell">{pIndex + 1}</td>
                      <td className="participant-name-cell">
                        <div className="participant-row-info">
                          <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} alt="" />
                          <span className="p-name-table">{p.name}</span>
                        </div>
                      </td>
                      
                      {activeDateIndex !== 'total' ? (
                        <>
                          <td className="start-time-cell">{formData.startTime}</td>
                          {[...Array(totalPigeonsPerDay)].map((_, i) => {
                            const isHelper = i < (formData.helperPigeons || 0);
                            const globalPigeonIdx = (activeDateIndex * totalPigeonsPerDay) + i;
                            return (
                              <td key={i} className={`time-input-cell ${isHelper ? 'helper-pigeon-cell' : ''}`}>
                                <input 
                                  type="time" 
                                  value={p.pigeonTimes && p.pigeonTimes[globalPigeonIdx] ? p.pigeonTimes[globalPigeonIdx] : ''}
                                  onChange={(e) => {
                                    handleTimeChange(pIndex, globalPigeonIdx, e.target.value);
                                  }}
                                  title={isHelper ? 'Helper Pigeon (Not counted in total)' : ''}
                                />
                              </td>
                            );
                          })}
                          <td className="total-time-cell">
                            {calculateTotalTime(
                              formData.startTime, 
                              (p.pigeonTimes || []).slice(activeDateIndex * totalPigeonsPerDay, (activeDateIndex + 1) * totalPigeonsPerDay), 
                              formData.numPigeons || 0
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          {flyingDates.map((_, idx) => (
                            <td key={idx} className="daily-total-cell">
                              {calculateTotalTime(
                                formData.startTime, 
                                (p.pigeonTimes || []).slice(idx * totalPigeonsPerDay, (idx + 1) * totalPigeonsPerDay), 
                                formData.numPigeons || 0
                                )}
                            </td>
                          ))}
                          <td className="grand-total-cell">
                            {calculateGrandTotal(p.pigeonTimes, totalPigeonsPerDay, formData.startTime, formData.numDays || 1, formData.numPigeons || 0)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={totalPigeonsPerDay + 4} className="no-data">
                      No participants added yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  
    if (view === 'edit') {
      return (
        <div className="tournament-edit-view">
          <div className="view-header">
            <div className="header-left">
              <button className="back-btn" onClick={() => setView('list')}><FaArrowLeft /> Back</button>
              <h2>{selectedTournament ? 'Edit Tournament' : 'Create Tournament'}</h2>
            </div>
            {selectedTournament && (
              <button className="add-time-btn" onClick={() => setView('time-entry')}>
                <FaClock /> Add Time
              </button>
            )}
          </div>
  
          <form className="tournament-form" onSubmit={handleSave}>
            <div className="form-grid">
              <div className="form-group">
                <label>Tournament Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
  
                {currentUser?.role === 'Super Admin' && (
                  <div className="form-group">
                    <label>Assign to Admin</label>
                    <select 
                      value={formData.admin}
                      onChange={(e) => setFormData({...formData, admin: e.target.value})}
                      required
                    >
                      <option value="">Select an Admin</option>
                      {(admins || []).map(admin => (
                        <option key={admin._id} value={admin._id}>{admin.name} ({admin.role})</option>
                      ))}
                    </select>
                  </div>
                )}
  
              <div className="form-group">
                <label>Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
  
              <div className="form-group">
                <label>Start Time</label>
                <input 
                  type="time" 
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
  
              <div className="form-group">
                <label>Number of Days (1-12)</label>
                <select 
                  value={formData.numDays || 1}
                  onChange={(e) => setFormData({...formData, numDays: parseInt(e.target.value) || 1})}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} Day{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
  
              <div className="form-group">
                <label>Number of Pigeons</label>
                <input 
                  type="number" 
                  value={formData.numPigeons || 0}
                  onChange={(e) => setFormData({...formData, numPigeons: parseInt(e.target.value) || 0})}
                />
              </div>
  
              <div className="form-group">
                <label>Note time for Pigeons</label>
                <input 
                  type="number" 
                  value={formData.noteTimePigeons || 0}
                  onChange={(e) => setFormData({...formData, noteTimePigeons: parseInt(e.target.value) || 0})}
                />
                <small>Must be ≤ Flying Pigeons</small>
              </div>
  
              <div className="form-group">
                <label>Helper Pigeons</label>
                <input 
                  type="number" 
                  value={formData.helperPigeons || 0}
                  onChange={(e) => setFormData({...formData, helperPigeons: parseInt(e.target.value) || 0})}
                />
              </div>
  
              <div className="form-group">
                <label>Total Pigeons (Auto)</label>
                <input 
                  type="number" 
                  value={(formData.numPigeons || 0) + (formData.helperPigeons || 0)}
                  readOnly
                  className="readonly-input"
                />
                <small>Sum of Pigeons + Helpers</small>
              </div>
  
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
  
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={formData.showOnHome}
                    onChange={(e) => setFormData({...formData, showOnHome: e.target.checked})}
                  />
                  Show on Home Screen
                </label>
              </div>
  
              <div className="form-group full-width">
                <label>Posters (Image URLs)</label>
                <div className="image-input-container">
                  <input 
                    type="text" 
                    placeholder="Paste Image URL here"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (e.target.value) {
                          setFormData({...formData, posters: [...formData.posters, e.target.value]});
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                  <small>Press Enter to add multiple images</small>
                </div>
                <div className="poster-preview-list">
                  {(formData.posters || []).map((url, index) => (
                    <div key={index} className="poster-tag">
                      <img src={url} alt="poster" />
                      <button type="button" onClick={() => {
                         const newPosters = [...(formData.posters || [])];
                         newPosters.splice(index, 1);
                         setFormData({...formData, posters: newPosters});
                      }}>x</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
  
            <div className="form-actions">
              {selectedTournament && currentUser?.role === 'Super Admin' && (
                <button type="button" className="delete-btn" onClick={handleDelete}>
                  <FaTrash /> Delete
                </button>
              )}
              <button type="submit" className="save-btn">
                <FaSave /> {selectedTournament ? 'Update Tournament' : 'Create Tournament'}
              </button>
              
              {selectedTournament && (
                <button 
                  type="button" 
                  className="add-person-btn" 
                  onClick={() => setParticipantModalOpen(true)}
                >
                  <FaUserPlus /> Add Persons
                </button>
              )}
            </div>
  
            {selectedTournament && (
              <div className="participants-section">
                <div className="participants-header">
                  <h3><FaUserFriends /> Enrolled Participants ({(formData.participants || []).length})</h3>
                </div>
  
                {participantModalOpen && (
                  <div className="modal-overlay">
                    <div className="participant-modal">
                      <div className="modal-header">
                        <h3>Add New Participant</h3>
                        <button type="button" className="close-btn" onClick={() => setParticipantModalOpen(false)}>&times;</button>
                      </div>
                      <div className="modal-body">
                        <div className="form-group">
                          <label>Participant Photo (Gallery)</label>
                          <div className="file-input-wrapper">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleImageChange}
                              id="participant-photo"
                            />
                            <label htmlFor="participant-photo" className="file-label">
                              {newParticipant.image ? 'Change Photo' : 'Select from Gallery'}
                            </label>
                            {newParticipant.image && (
                              <div className="photo-preview">
                                <img src={newParticipant.image} alt="Preview" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="form-group">
                          <label>Full Name *</label>
                          <input 
                            type="text" 
                            value={newParticipant.name}
                            onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                            placeholder="Enter name"
                          />
                        </div>
                        <div className="form-group">
                          <label>Phone Number (Optional)</label>
                          <input 
                            type="text" 
                            value={newParticipant.phone}
                            onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
                            placeholder="Contact number"
                          />
                        </div>
                        <div className="form-group">
                          <label>Address (Optional)</label>
                          <input 
                            type="text" 
                            value={newParticipant.address}
                            onChange={(e) => setNewParticipant({...newParticipant, address: e.target.value})}
                            placeholder="Full address"
                          />
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="cancel-btn" onClick={() => setParticipantModalOpen(false)}>Cancel</button>
                        <button type="button" className="confirm-btn" onClick={handleAddParticipant}>Enroll Participant</button>
                      </div>
                    </div>
                  </div>
                )}
  
                <div className="participants-grid">
                  {(formData.participants || []).map((p, index) => (
                    <div key={index} className="participant-card-mini">
                      <img src={p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random`} alt={p.name} />
                      <div className="p-details">
                        <span className="p-name">{p.name}</span>
                        {p.phone && <span className="p-phone">{p.phone}</span>}
                      </div>
                      <button type="button" className="p-remove" onClick={() => removeParticipant(index)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      );
    }
  
    return (
      <div className="tournaments-section">
        <div className="section-header">
          <div className="header-text">
            <h2>Tournament Management</h2>
            <p>View and manage all your pigeon flying tournaments</p>
          </div>
          {currentUser?.role === 'Super Admin' && (
            <button className="add-btn" onClick={handleCreateNew}>
              <FaPlus /> New Tournament
            </button>
          )}
        </div>
  
        <div className="tournaments-list">
          {!tournaments || tournaments.length === 0 ? (
            <p className="no-data">No tournaments found. Click "New Tournament" to add one.</p>
          ) : (
            <div className="tournament-grid">
              {(tournaments || []).map((t) => {
                const isUserAdmin = (t.admin?._id || t.admin) === currentUser?.id;
                return (
                  <div 
                    key={t._id} 
                    className={`tournament-card ${isUserAdmin ? 'my-tournament' : ''}`} 
                    onClick={() => handleEdit(t)}
                  >
                    <div className="card-top">
                      <span className={`status-badge ${t.status.toLowerCase()}`}>{t.status}</span>
                      <div className="card-icon"><FaTrophy /></div>
                    </div>
                    <div className="card-info">
                      <h3>{t.name}</h3>
                      <div className="card-details">
                        <div className="detail-item">
                          <FaUserShield className="detail-icon" />
                          <span>{t.admin?.name || 'Unassigned'}</span>
                        </div>
                        <div className="detail-item">
                          <FaCalendarAlt className="detail-icon" />
                        <span>{t.startDate ? new Date(t.startDate).toLocaleDateString() : 'No date'} {t.startTime || ''}</span>
                        </div>
                        <div className="detail-item">
                          <FaDove className="detail-icon" />
                        <span>{t.totalPigeons || (t.numPigeons + t.helperPigeons)} Pigeons</span>
                        </div>
                        <div className="detail-item">
                          <FaClock className="detail-icon" />
                          <span>{t.numDays} Days</span>
                        </div>
                      </div>
                      
                      {(t.firstWinner || t.lastWinner) && (
                        <div className="card-winners-mini">
                          {t.firstWinner && <div className="winner-small-badge first">1st: {t.firstWinner}</div>}
                          {t.lastWinner && <div className="winner-small-badge last">Last: {t.lastWinner}</div>}
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <button className="edit-link">
                        {isUserAdmin || currentUser?.role === 'Super Admin' ? 'Edit Details' : 'View Only'}
                      </button>
                      {isUserAdmin && <span className="admin-badge">My Tournament</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderView()}
      
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalContent.title} 
        message={modalContent.message}
        onConfirm={modalContent.onConfirm}
        confirmText={modalContent.confirmText}
      />
    </>
  );
};

export default Tournaments;
