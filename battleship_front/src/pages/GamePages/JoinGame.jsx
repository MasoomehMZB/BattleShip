import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JoinGame.css';

function JoinGamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
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

    const fetchWaitingGames = async () => {
      try {
        if (!token) {
          setError('❌ You must be logged in to join games.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/games/waiting/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        
        setGames(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching waiting games:', err);
        setError('❌ Failed to load available games. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchWaitingGames();
  }, [token]);

  const handleJoin = async (gameId) => {
    setJoiningId(gameId);
    setError('');

    try {
      const response = await axios.post(
        `http://localhost:8000/api/games/${gameId}/join/`, 
        {}, 
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // Show success message briefly before redirecting
      setError('✅ Successfully joined the battle! Redirecting...');
      
      setTimeout(() => {
        navigate(`/ship-placement/${gameId}`);
      }, 1500);

    } catch (err) {
      console.error('Error joining game:', err);
      setJoiningId(null);
      
      if (err.response?.data?.error) {
        setError(`❌ ${err.response.data.error}`);
      } else {
        setError('❌ Failed to join the battle. Please try again.');
      }
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

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🔴';
      default:
        return '🟢';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  if (loading) {
    return (
      <div className="join-game-page-container">
        <div className="join-game-box">
          <h1 className="join-game-page-title">🎮 Join a Battle</h1>
          <div className="loading-message">⚓ Searching for available battles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-game-page-container">
      <div className="join-game-box">
        <h1 className="join-game-page-title">🎮 Join a Battle</h1>

        <div className="join-game-content">
          {error && (
            <div className={`message ${error.includes('✅') ? 'success-message' : 'error-message'}`}>
              {error}
            </div>
          )}

          <div className="games-info">
            <div className="info-header">
              <span className="games-count">
                {games.length} Available Battle{games.length !== 1 ? 's' : ''}
              </span>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-button"
                title="Refresh available games"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {games.length === 0 ? (
            <div className="no-games-container">
              <div className="no-games-message">
                <div className="no-games-icon">🌊</div>
                <h3>No Battles Available</h3>
                <p>All captains are currently engaged in battle!</p>
                <div className="no-games-suggestions">
                  <p>You can:</p>
                  <ul>
                    <li>🔄 Refresh to check for new battles</li>
                    <li>⚔️ Start your own battle</li>
                    <li>⏳ Wait for other players to create games</li>
                  </ul>
                </div>
                <button 
                  onClick={() => navigate('/start-game')} 
                  className="create-game-button"
                >
                  ⚔️ Start New Battle
                </button>
              </div>
            </div>
          ) : (
            <div className="games-list">
              {games.map((game, index) => (
                <div key={game.id} className="game-card">
                  <div className="game-card-header">
                    <div className="game-number">
                      <span className="battle-label">Battle</span>
                      <span className="battle-number">#{index + 1}</span>
                    </div>
                    <div className="game-status">
                      <span className="status-badge status-waiting">
                        🕒 Waiting
                      </span>
                    </div>
                  </div>

                  <div className="game-card-body">
                    <div className="game-info">
                      <div className="creator-info">
                        <div className="creator-avatar">👑</div>
                        <div className="creator-details">
                          <span className="creator-label">Captain</span>
                          <span className="creator-name">{game.creator}</span>
                        </div>
                      </div>

                      <div className="game-details">
                        <div className="game-detail">
                          <span className="detail-icon">🎯</span>
                          <span className="detail-label">Difficulty:</span>
                          <span className={`difficulty-badge ${getDifficultyClass(game.difficulty)}`}>
                            {getDifficultyIcon(game.difficulty)} {game.difficulty}
                          </span>
                        </div>
                        
                        <div className="game-detail">
                          <span className="detail-icon">📅</span>
                          <span className="detail-label">Created:</span>
                          <span className="detail-value">{formatDate(game.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="game-actions">
                      <button
                        className={`join-button ${joiningId === game.id ? 'joining' : ''}`}
                        onClick={() => handleJoin(game.id)}
                        disabled={joiningId === game.id}
                        title={`Join ${game.creator}'s battle`}
                      >
                        {joiningId === game.id ? (
                          <>
                            <span className="loading-spinner"></span>
                            Joining...
                          </>
                        ) : (
                          <>
                            ⚔️ Join Battle
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="battle-instructions">
            <h4 className="instructions-title">⚓ How to Join a Battle:</h4>
            <ul className="instructions-list">
              <li>🎯 Choose a battle based on difficulty level</li>
              <li>👑 See who the captain (creator) is</li>
              <li>⚔️ Click "Join Battle" to enter</li>
              <li>🚢 Arrange your fleet on the board</li>
              <li>🏆 Battle begins when both fleets are ready!</li>
            </ul>
          </div>
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

export default JoinGamePage;
