import { Link } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut } from 'lucide-react';
import './Navbar.css';

function Navbar({ username, onLogout }) {
  return (
    <div className="navbar-wrapper">
      <Link to="/dashboard" className="navbar-brand">
        <LayoutDashboard className="icon" size={20} />
        Event Management
      </Link>
      <div className="navbar-links">
        <Link to="/dashboard">
          <LayoutDashboard size={18} /> Dashboard
        </Link>
        <Link to="/events">
          <Calendar size={18} /> Events
        </Link>
      </div>
      <div className="navbar-actions">
        <span>{username}</span>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
