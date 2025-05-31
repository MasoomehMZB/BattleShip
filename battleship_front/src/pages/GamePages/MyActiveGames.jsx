import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyActiveGame.css';

function MyActiveGames() {
  const [waitingGames, setWaitingGames] = useState([]);
  const [inProgressGames, setInProgressGames] = useState([]);
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
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/games/history/', {
          headers: {
            Authorization: `Token ${token}`
          }
        });

        const games = response.data;
        setWaitingGames(games.filter(game => game.status === 'Waiting'));
        setInProgressGames(games.filter(game => game.status === 'In Progress'));
      } catch (err) {
        console.error('Error fetching my games:', err);
        setError('Failed to load your active games.');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchGames();
  }, []);

  const handleArrangeClick = (gameId) => {
    navigate(`/ship-placement/${gameId}`);
  };

  const handlePlayClick = (gameId) => {
    navigate(`/gameplay/${gameId}`);
  };

  const getPlayerDisplay = (playerName) => {
    if (!playerName) {
      return 'Waiting for opponent...';
    }
    return playerName === currentUser ? `${playerName} (You)` : playerName;
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
      <div className="my-active-games-page-container">
        <div className="my-active-games-box">
          <h1 className="my-active-games-page-title">🎮 My Active Games</h1>
          <div className="loading-message">⚓ Loading your active battles...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-active-games-page-container">
        <div className="my-active-games-box">
          <h1 className="my-active-games-page-title">🎮 My Active Games</h1>
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
    <div className="my-active-games-page-container">
      <div className="my-active-games-box">
        <h1 className="my-active-games-page-title">🎮 My Active Games</h1>

        <section className="games-section">
          <h2 className="section-title">
            🕒 Waiting Games
            {waitingGames.length > 0 && (
              <span className="status-badge status-waiting">
                {waitingGames.length} game{waitingGames.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          
          {waitingGames.length === 0 ? (
            <div className="no-games-message">
              🌊 No games waiting for opponents at the moment.
            </div>
          ) : (
            <ul className="games-list">
              {waitingGames.map((game, index) => (
                <li key={game.id} className="game-item waiting-game-item">
                  <div className="game-content">
                    <div className="game-info">
                      <h3 className="game-title">⚔️ Battle #{index + 1}</h3>
                      <div className="game-details">
                        <div className="game-detail">
                          <span className="game-detail-label">🎯 Difficulty:</span>
                          <span>{game.difficulty}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">👑 Creator:</span>
                          <span>{getPlayerDisplay(game.creator)}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">🏴‍☠️ Opponent:</span>
                          <span>{getPlayerDisplay(game.opponent)}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">📅 Created:</span>
                          <span>{formatDate(game.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="game-actions">
                      <span className="status-badge status-waiting">
                        🕒 Waiting
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="games-section">
          <h2 className="section-title">
            🚀 In Progress Games
            {inProgressGames.length > 0 && (
              <span className="status-badge status-in-progress">
                {inProgressGames.length} game{inProgressGames.length !== 1 ? 's' : ''}
              </span>
            )}
          </h2>
          
          {inProgressGames.length === 0 ? (
            <div className="no-games-message">
              ⚓ No battles currently in progress.
            </div>
          ) : (
            <ul className="games-list">
              {inProgressGames.map((game, index) => (
                <li key={game.id} className="game-item in-progress-game-item">
                  <div className="game-content">
                    <div className="game-info">
                      <h3 className="game-title">⚔️ Battle #{index + 1}</h3>
                      <div className="game-details">
                        <div className="game-detail">
                          <span className="game-detail-label">🎯 Difficulty:</span>
                          <span>{game.difficulty}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">👑 Creator:</span>
                          <span>{getPlayerDisplay(game.creator)}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">🏴‍☠️ Opponent:</span>
                          <span>{getPlayerDisplay(game.opponent)}</span>
                        </div>
                        <div className="game-detail">
                          <span className="game-detail-label">📅 Started:</span>
                          <span>{formatDate(game.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="game-actions">
                      <button
                        onClick={() => handleArrangeClick(game.id)}
                        className="arrange-board-button"
                        title="Arrange your ships on the board"
                      >
                        🚢 Arrange Board
                      </button>
                      <button
                        onClick={() => handlePlayClick(game.id)}
                        className="play-game-button"
                        title="Enter the battle"
                      >
                        ⚔️ Play Game
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
        
        <div className="back-button-container">
          <button onClick={() => navigate('/game')} className="back-button">
            🏠 Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyActiveGames;
