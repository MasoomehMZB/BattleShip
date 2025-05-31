import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditProfile() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('You must be logged in to edit your profile');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:8000/api/account/me/edit/',
        { username, password },
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
      if (password) {
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage('Error updating profile: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Edit Profile</h1>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: message.includes('Error') ? '#ffdddd' : '#ddffdd',
          marginBottom: '20px',
          borderRadius: '5px'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
            New Username (optional):
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            New Password (optional):
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          {password && (
            <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '5px' }}>
              Note: You will be logged out after changing your password.
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            style={{
              padding: '10px 15px',
              backgroundColor: '#333333',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Update Profile
          </button>
          
          <button 
            type="button" 
            onClick={() => navigate('/game')}
            style={{
              padding: '10px 15px',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}