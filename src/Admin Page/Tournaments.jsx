import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaUserShield } from 'react-icons/fa';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTournament, setNewTournament] = useState({ name: '', admin: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
    fetchAdmins();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`);
      const data = await response.json();
      setTournaments(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins`);
      if (response.status === 404) {
        setAdmins([{ id: 1, name: "Default Admin" }]);
        return;
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTournament),
      });
      if (response.ok) {
        setShowModal(false);
        setNewTournament({ name: '', admin: '' });
        fetchTournaments();
      }
    } catch (error) {
      console.error("Error creating tournament:", error);
    }
  };

  if (loading) return <div>Loading Tournaments...</div>;

  return (
    <div className="tournaments-section">
      <div className="section-header">
        <h2>Manage Tournaments</h2>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <FaPlus /> New Tournament
        </button>
      </div>

      <div className="tournaments-list">
        {tournaments.length === 0 ? (
          <p>No tournaments found.</p>
        ) : (
          <div className="tournament-grid">
            {tournaments.map((t) => (
              <div key={t.id} className="tournament-card">
                <div className="card-icon"><FaTrophy /></div>
                <div className="card-info">
                  <h3>{t.name}</h3>
                  <p><FaUserShield /> Admin: {t.admin}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Tournament</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Tournament Name</label>
                <input 
                  type="text" 
                  value={newTournament.name}
                  onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Assign Admin</label>
                <select 
                  value={newTournament.admin}
                  onChange={(e) => setNewTournament({...newTournament, admin: e.target.value})}
                >
                  <option value="">Default Admin</option>
                  {admins.map(admin => (
                    <option key={admin.id} value={admin.name}>{admin.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments;
