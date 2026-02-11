import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './AdminDashboard.css';
import { FaTachometerAlt, FaList, FaTrophy, FaUserFriends, FaNewspaper, FaUserShield, FaEllipsisV } from 'react-icons/fa';

const AdminDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { title: 'Dashboard', icon: <FaTachometerAlt />, path: '/admin' },
    { title: 'Categories', icon: <FaList />, path: '/admin/categories' },
    { title: 'Tournament', icon: <FaTrophy />, path: '/admin/tournaments' },
    { title: 'Piegon Owners', icon: <FaUserFriends />, path: '/admin/owners' },
    { title: 'News', icon: <FaNewspaper />, path: '/admin/news' },
    { title: 'Admin Users', icon: <FaUserShield />, path: '/admin/users' },
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.title : 'Admin Panel';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-left">
          <h2>{getPageTitle()}</h2>
        </div>
        <div className="header-right">
          <FaEllipsisV 
            className="menu-dots" 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
          />
        </div>
      </div>

      <div className={`admin-sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item, index) => (
            <li 
              key={index} 
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.path)}
            >
              <span className="icon">{item.icon}</span>
              <span className="title">{item.title}</span>
            </li>
          ))}
        </ul>
      </div>

      {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <div className="admin-content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboard;
