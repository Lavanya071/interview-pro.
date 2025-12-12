import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import QuestionList from './components/QuestionList';
import QuestionDetails from './components/QuestionDetails';
import AddQuestion from './components/AddQuestion';
import MockTest from './components/MockTest';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<QuestionList />} />
            <Route path="/questions/:id" element={<QuestionDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/add" element={<ProtectedRoute><AddQuestion /></ProtectedRoute>} />
            <Route path="/mock" element={<MockTest />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={2500} />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
