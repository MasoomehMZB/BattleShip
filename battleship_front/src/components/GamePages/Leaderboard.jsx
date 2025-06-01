import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlayers } from './Leaderboard.js';
import "../../styles/components/GamePages/Leaderboard.css";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  const getRankClass = (index) => {
    if (index === 0) return 'first-place';
    if (index === 1) return 'second-place';
    if (index === 2) return 'third-place';
    return '';
  };

  const getRankNumber = (index) => {
    return `rank-${index + 1}`;
  };

  if (loading) {
    return (
      <div className="leaderboard-page-container">
        <div className="leaderboard-box">
          <h1 className="leaderboard-page-title">🏆 Leaderboard</h1>
          <div className="loading-message">⚓ Loading leaderboard...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="leaderboard-page-container">
        <div className="leaderboard-box">
          <h1 className="leaderboard-page-title">🏆 Leaderboard</h1>
          <div className="error-message">{error}</div>
          <div className="back-button-container">
            <button onClick={() => navigate('/game')} className="back-button">
              🏠 Back to Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-page-container">
      <div className="leaderboard-box">
        <h1 className="leaderboard-page-title">🏆 Leaderboard</h1>
        
        <div className="leaderboard-content">
          {players.length > 0 ? (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>🎖️ Rank</th>
                  <th>🏴‍☠️ Captain</th>
                  <th>💰 Points</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr 
                    key={player.id || index} 
                    className={`leaderboard-item ${getRankClass(index)}`}
                  >
                    <td className={`rank ${getRankNumber(index)}`}>
                      {index + 1}
                    </td>
                    <td className="username">{player.username}</td>
                    <td className="points">{player.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-players-message">
              🌊 No captains have sailed these waters yet...
            </div>
          )}
        </div>
        
        <div className="back-button-container">
          <button onClick={() => navigate('/game')} className="back-button">
            🏠 Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
