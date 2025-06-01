import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/components/Account/Login.css'

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:8000/api/account/login/', {
        username,
        password,
      });

      // Save the token to localStorage
      localStorage.setItem('token', response.data.token);
      setMessage('Login successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/game'); // Redirect to Game after successful login
      }, 1000);

    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.non_field_errors?.[0] || 'Login failed');
      } else {
        setMessage('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">🏴‍☠️ Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
        {message && (
          <p className={message.includes('successful') ? 'success-message' : 'error-message'}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
