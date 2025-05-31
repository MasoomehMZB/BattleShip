import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GameHistory.css';

export default function GameHistory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get('http://localhost:8000/api/account/me/', {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
          setCurrentUser(response.data.username);
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err);
      }
    };

    const fetchGames = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/games/history/', {
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

    fetchCurrentUser();
    fetchGames();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'finished':
        return 'status-finished';
      case 'in progress':
        return 'status-in-progress';
      case 'waiting':
        return 'status-waiting';
      default:
        return 'status-waiting';
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-easy';
    }
  };

  const getWinnerDisplay = (game) => {
    if (!game.winner) {
      return <span className="winner-tbd">TBD</span>;
    }
    
    if (game.winner === currentUser) {
      return <span className="winner-you">You</span>;
    } else {
      return <span className="winner-opponent">{game.winner}</span>;
    }
  };

  const getPlayerDisplay = (playerName) => {
    if (!playerName) {
      return <span className="opponent-waiting">Waiting...</span>;
    }
    
    if (playerName === currentUser) {
      return <span className="player-you">{playerName}</span>;
    } else {
      return <span className="player-name">{playerName}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="game-history-page-container">
        <div className="game-history-box">
          <h2 className="game-history-page-title">📜 My Battle History</h2>
          <div className="loading-message">⚓ Loading your battle records...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="game-history-page-container">
        <div className="game-history-box">
          <h2 className="game-history-page-title">📜 My Battle History</h2>
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
    <div className="game-history-page-container">
      <div className="game-history-box">
        <h2 className="game-history-page-title">📜 My Battle History</h2>
        
        <div className="game-history-content">
          {games.length === 0 ? (
            <div className="no-games-message">
              🌊 No battles have been fought yet, Captain!
            </div>
          ) : (
            <table className="game-history-table">
              <thead>
                <tr>
                  <th>#️⃣ No.</th>
                  <th>⚔️ Difficulty</th>
                  <th>👑 Creator</th>
                  <th>🏴‍☠️ Opponent</th>
                  <th>📊 Status</th>
                  <th>🏆 Winner</th>
                  <th>📅 Created</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game, index) => (
                  <tr key={game.id}>
                    <td>
                      <span className="game-number">#{index + 1}</span>
                    </td>
                    <td>
                      <span className={getDifficultyClass(game.difficulty)}>
                        {game.difficulty}
                      </span>
                    </td>
                    <td>{getPlayerDisplay(game.creator)}</td>
                    <td>{getPlayerDisplay(game.opponent)}</td>
                    <td>
                      <span className={getStatusClass(game.status)}>
                        {game.status}
                      </span>
                    </td>
                    <td>{getWinnerDisplay(game)}</td>
                    <td>
                      <span className="game-date">
                        {formatDate(game.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
