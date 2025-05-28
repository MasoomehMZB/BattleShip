// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

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
    return <div style={{ margin: '2rem' }}><p>{error}</p></div>;
  }

  if (!profile) {
    return <div style={{ margin: '2rem' }}><p>Loading...</p></div>;
  }

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>My Profile</h2>
      <p><strong>Username:</strong> {profile.username}</p>
      <p><strong>Level:</strong> {profile.level}</p>
      <p><strong>Points:</strong> {profile.points}</p>
      <p><strong>Total Games:</strong> {profile.total_games}</p>
    </div>
  );
}
