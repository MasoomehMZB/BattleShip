// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/components/Account/Profile.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You are not logged in.');
      return;
    }

    axios.get('http://localhost:8000/api/account/me/', {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    .then(response => {
      setProfile(response.data);
    })
    .catch(err => {
      setError('Failed to load profile.');
      console.error(err);
    });
  }, []);

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-box">
          <h2 className="profile-title">⚠️ Error</h2>
          <div className="error-message">{error}</div>
          <div className="profile-actions">
            <button onClick={() => navigate('/login')} className="profile-button">
              🔑 Go to Login
            </button>
            <button onClick={() => navigate('/game')} className="profile-button back-button">
              🏠 Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="profile-box">
          <h2 className="profile-title">👤 Profile</h2>
          <div className="loading-message">⚓ Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2 className="profile-title">👤 My Profile</h2>
        
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-item">
              <span className="info-label">🏴‍☠️ Captain Name:</span>
              <span className="info-value">{profile.username}</span>
            </div>
            
            <div className="info-item">
              <span className="info-label">⭐ Level:</span>
              <span className="level-badge">
                🎖️ {profile.level}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">💰 Points:</span>
              <span className="points-badge">
                💎 {profile.points}
              </span>
            </div>
            
            <div className="info-item">
              <span className="info-label">⚔️ Total Battles:</span>
              <span className="games-badge">
                🎯 {profile.total_games}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button onClick={() => navigate('/game')} className="profile-button back-button">
              🏠 Back to Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
