import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaUserShield, FaArrowLeft, FaSave, FaTrash, FaImage } from 'react-icons/fa';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('adminUser'));

  const initialFormState = {
    name: '',
    admin: currentUser?.id || '',
    startDate: new Date().toISOString().split('T')[0],
    numDays: 1,
    numPigeons: 0,
    noteTimePigeons: 0,
    helperPigeons: 0,
    status: 'Upcoming',
    showOnHome: true,
    posters: []
  };

  const [formData, setFormData] = useState(initialFormState);

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
      setTournaments(data);
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
    setSelectedTournament(t);
    setFormData({
      ...initialFormState,
      ...t,
      admin: t.admin?._id || t.admin,
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      posters: t.posters || []
    });
    setView('edit');
  };

  const handleCreateNew = () => {
    setSelectedTournament(null);
    setFormData(initialFormState);
    setView('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.noteTimePigeons > formData.numPigeons) {
      alert("Note time pigeons cannot be greater than total number of pigeons");
      return;
    }

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
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setView('list');
        fetchTournaments();
      }
    } catch (error) {
      console.error("Error saving tournament:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this tournament?")) return;
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

  if (view === 'edit') {
    return (
      <div className="tournament-edit-view">
        <div className="view-header">
          <button className="back-btn" onClick={() => setView('list')}><FaArrowLeft /> Back</button>
          <h2>{selectedTournament ? 'Edit Tournament' : 'Create Tournament'}</h2>
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
              <small>Must be ≤ Total Pigeons</small>
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
            {selectedTournament && (
              <button type="button" className="delete-btn" onClick={handleDelete}>
                <FaTrash /> Delete
              </button>
            )}
            <button type="submit" className="save-btn">
              <FaSave /> {selectedTournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="tournaments-section">
      <div className="section-header">
        <h2>Manage Tournaments</h2>
        <button className="add-btn" onClick={handleCreateNew}>
          <FaPlus /> New Tournament
        </button>
      </div>

      <div className="tournaments-list">
        {!tournaments || tournaments.length === 0 ? (
          <p className="no-data">No tournaments found. Click "New Tournament" to add one.</p>
        ) : (
          <div className="tournament-grid">
            {(tournaments || []).map((t) => (
              <div key={t._id} className="tournament-card" onClick={() => handleEdit(t)}>
                <div className="card-badge" data-status={t.status}>{t.status}</div>
                <div className="card-icon"><FaTrophy /></div>
                <div className="card-info">
                  <h3>{t.name}</h3>
                  <div className="card-meta">
                    <span><FaUserShield /> {t.admin?.name || 'Unassigned'}</span>
                    <span>Days: {t.numDays}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tournaments;
