import React, { useState, useContext } from 'react';
import api from '../api';
import AuthContext from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Register() {
  const { login } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(data.user, data.token);
      toast.success('Registered and logged in');
      nav('/');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.msg || 'Register failed');
    }
  };

  return (
    <div className="card">
      <h3>Register</h3>
      <form className="form" onSubmit={handle}>
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
