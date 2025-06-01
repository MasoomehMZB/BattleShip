import axios from 'axios';

export const getPlayers = async () => {
  const token = localStorage.getItem('token');
  
  // Check if token exists before making the request
  if (!token) {
    console.error('Authentication token not found');
    return [];
  }

  try {
    const response = await axios.get('http://127.0.0.1:8000/api/games/leaderboard/', {
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json'
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    if (error.response && error.response.status === 401) {
      console.error('Authentication failed. Token may be invalid or expired.');
      // You might want to redirect to login page here
      // window.location.href = '/login';
    }
    return [];
  }
};