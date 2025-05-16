// Api.js
import axios from 'axios';

export const getPlayers = async () => {
  const token = localStorage.getItem('authToken');

  try {
    const response = await axios.get('http://127.0.0.1:8000/api/players/', {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
};
