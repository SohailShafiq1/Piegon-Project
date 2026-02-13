import React, { useState, useEffect } from 'react';
import './ManageAdmins.css';

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Admin created successfully');
        setName('');
        setEmail('');
        setPassword('');
        setRole('Admin');
        fetchAdmins();
      } else {
        setError(data.message || 'Failed to create admin');
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
        <h4>Create New Admin</h4>
        <form onSubmit={handleCreateAdmin}>
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
              <label>Password (Required)</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
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
          <button type="submit">Create Admin</button>
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
