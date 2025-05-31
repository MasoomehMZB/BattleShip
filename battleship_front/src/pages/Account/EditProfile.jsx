import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProfile.css';

export default function EditProfile() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  const fetchCurrentProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('You must be logged in to edit your profile');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/account/me/', {
        headers: {
          'Authorization': `Token ${token}`,
        }
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Failed to load profile data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('You must be logged in to edit your profile');
        setLoading(false);
        return;
      }

      const updateData = {};
      if (username.trim()) {
        updateData.username = username.trim();
      }
      if (password.trim()) {
        updateData.password = password;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage('Please provide at least one field to update');
        setLoading(false);
        return;
      }
      
      const response = await axios.post(
        'http://localhost:8000/api/account/me/edit/',
        updateData,
        {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage('Profile updated successfully!');
      
      // Clear the form
      setUsername('');
      setPassword('');
      
      // If password was changed, redirect to login after 2 seconds
      if (updateData.password) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.error) {
        setMessage(`Error: ${error.response.data.error}`);
      } else {
        setMessage('Error updating profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-box">
        <h1 className="edit-profile-title">✏️ Edit Profile</h1>
        
        {message && (
          <div className={`message ${message.includes('Error') || message.includes('Failed') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              👤 New Username (optional):
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="form-input"
              placeholder="Enter new username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔐 New Password (optional):
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter new password"
            />
            {password && (
              <p className="password-note">
                ⚠️ Note: You will be logged out after changing your password.
              </p>
            )}
          </div>
          
          <div className="button-group">
            <button 
              type="submit" 
              className={`button button-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Updating...' : '💾 Update Profile'}
            </button>
            
            <button 
              type="button" 
              onClick={() => navigate('/game')}
              className="button button-secondary"
              disabled={loading}
            >
              ↩️ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
