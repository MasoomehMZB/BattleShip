import { useEffect, useState } from 'react';
import { getPlayers } from './Leaderboard.js';
import "./leaderboard.css";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const data = await getPlayers();
        setPlayers(data);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard. Please ensure you are logged in.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;
  
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      {players.length > 0 ? (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.id} className="leaderboard-item">
                <td className="rank">{index + 1}</td>
                <td className="username">{player.username}</td>
                <td className="points">{player.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No players found.</p>
      )}
    </div>
  );
}

export default Leaderboard;