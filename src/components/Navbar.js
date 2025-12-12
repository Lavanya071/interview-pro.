import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../styles.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">InterviewPrep</Link>
      </div>
      <div className="nav-right">
        <Link className={isActive('/')} to="/">Questions</Link>
        <Link className={isActive('/mock')} to="/mock">Mock Test</Link>
        {user ? (
          <>
            <span className="greeting">Hello, {user.name}</span>
            <Link className={isActive('/add')} to="/add">Add Q</Link>
            <button className="btn-logout" onClick={() => { logout(); nav('/login'); }}>Logout</button>
          </>
        ) : (
          <>
            <Link className={isActive('/login')} to="/login">Login</Link>
            <Link className={isActive('/register')} to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
