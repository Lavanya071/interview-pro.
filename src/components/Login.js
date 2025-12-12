import React, { useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data.user, data.token);
      toast.success('Logged in');
      nav('/');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="card">
      <h3>Login</h3>
      <form className="form" onSubmit={handle}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
