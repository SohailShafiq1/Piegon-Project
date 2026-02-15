import React, { useState, useEffect } from 'react';
import './ManageAdmins.css';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [editAdminId, setEditAdminId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('adminUser'));
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAdmins(data);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const url = editAdminId 
      ? `${import.meta.env.VITE_API_BASE_URL}/admins/${editAdminId}`
      : `${import.meta.env.VITE_API_BASE_URL}/admins`;
    
    const method = editAdminId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password: password || undefined, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(editAdminId ? 'Admin updated successfully' : 'Admin created successfully');
        setName('');
        setEmail('');
        setPassword('');
        setRole('Admin');
        setEditAdminId(null);
        fetchAdmins();
      } else {
        setError(data.message || 'Failed to process request');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const handleEdit = (admin) => {
    setEditAdminId(admin._id);
    setName(admin.name);
    setEmail(admin.email || '');
    setPassword('');
    setRole(admin.role);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditAdminId(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Admin');
    setMessage('');
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Admin deleted successfully');
        fetchAdmins();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete admin');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  if (currentUser?.role !== 'Super Admin') {
    return <div className="no-access">Only Super Admin can access this page.</div>;
  }

  return (
    <div className="manage-admins">
      <h3>Manage Admins</h3>
      
      <div className="admin-form-card">
        <h4>{editAdminId ? 'Update Admin' : 'Create New Admin'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name (Required)</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email (Optional)</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label>{editAdminId ? 'Password (Leave blank to keep current)' : 'Password (Required)'}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required={!editAdminId} 
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="Admin">Admin</option>
                <option value="Super Admin">Super Admin</option>
              </select>
            </div>
          </div>
          {message && <p className="success-msg">{message}</p>}
          {error && <p className="error-msg">{error}</p>}
          <div className="form-buttons">
            <button type="submit">{editAdminId ? 'Update Admin' : 'Create Admin'}</button>
            {editAdminId && (
              <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-list-card">
        <h4>Existing Admins</h4>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map(admin => (
                <tr key={admin._id}>
                  <td>{admin.name}</td>
                  <td>{admin.email || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${admin.role === 'Super Admin' ? 'super' : 'admin'}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td>{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={() => handleEdit(admin)}
                        disabled={admin.name === 'Admin' && currentUser.name !== 'Admin'}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn" 
                        onClick={() => handleDelete(admin._id)}
                        disabled={admin._id === currentUser.id || admin.name === 'Admin'}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;
