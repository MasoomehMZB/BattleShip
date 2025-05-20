import { useEffect, useState } from 'react';
import axios from 'axios';

export default function GameHistory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/history/', {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        });
        setGames(response.data);
      } catch (err) {
        setError('Failed to load game history.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading game history...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <h2 style={{ textAlign: 'center' }}>My Game History</h2>
      {games.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No games found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Creator</th>
              <th style={thStyle}>Opponent</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Winner</th>
              <th style={thStyle}>Created</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.id}>
                <td style={tdStyle}>{game.id}</td>
                <td style={tdStyle}>{game.difficulty}</td>
                <td style={tdStyle}>{game.creator}</td>
                <td style={tdStyle}>{game.opponent || 'Waiting...'}</td>
                <td style={{ ...tdStyle, color: game.status === 'Finished' ? 'green' : 'orange' }}>
                  {game.status}
                </td>
                <td style={tdStyle}>{game.winner || 'TBD'}</td>
                <td style={tdStyle}>{new Date(game.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  borderBottom: '2px solid #ccc',
  padding: '10px',
  textAlign: 'left',
};

const tdStyle = {
  borderBottom: '1px solid #eee',
  padding: '8px',
};
