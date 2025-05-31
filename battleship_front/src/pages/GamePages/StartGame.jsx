import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './StartGame.css';

function StartGame() {
  const [difficulty, setDifficulty] = useState('0');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartGame = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('❌ You must be logged in to start a game.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/games/create/',
        { difficulty },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setMessage('✅ Game created successfully! Redirecting...');
      
      // Redirect to back to my-active-games after successful game creation
      setTimeout(() => {
        navigate(`/my-active-games`);
      }, 1500);

    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(`❌ ${error.response.data.error}`);
      } else {
        setMessage('❌ Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyDescription = (difficultyValue) => {
    switch (difficultyValue) {
      case '0':
        return {
          name: 'Easy',
          description: 'Perfect for beginners - smaller board, fewer ships',
          emoji: '🟢',
          color: '#28a745'
        };
      case '1':
        return {
          name: 'Medium',
          description: 'Balanced challenge - standard board size',
          emoji: '🟡',
          color: '#ffc107'
        };
      case '2':
        return {
          name: 'Hard',
          description: 'For experienced captains - larger board, more ships',
          emoji: '🔴',
          color: '#dc3545'
        };
      default:
        return {
          name: 'Easy',
          description: 'Perfect for beginners',
          emoji: '🟢',
          color: '#28a745'
        };
    }
  };

  const currentDifficulty = getDifficultyDescription(difficulty);

  return (
    <div className="start-game-page-container">
      <div className="start-game-box">
        <h2 className="start-game-page-title">⚔️ Start New Battle</h2>
        
        <div className="start-game-content">
          <div className="difficulty-preview">
            <div className="difficulty-preview-header">
              <span className="difficulty-emoji">{currentDifficulty.emoji}</span>
              <h3 className="difficulty-name" style={{ color: currentDifficulty.color }}>
                {currentDifficulty.name} Difficulty
              </h3>
            </div>
            <p className="difficulty-description">
              {currentDifficulty.description}
            </p>
          </div>

          {message && (
            <div className={`message ${message.includes('✅') ? 'success-message' : 'error-message'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleStartGame} className="start-game-form">
            <div className="form-group">
              <label className="form-label">
                🎯 Choose Your Battle Difficulty:
              </label>
              
              <div className="difficulty-options">
                <label className={`difficulty-option ${difficulty === '0' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="0"
                    checked={difficulty === '0'}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="difficulty-radio"
                  />
                  <div className="difficulty-card easy">
                    <div className="difficulty-header">
                      <span className="difficulty-icon">🟢</span>
                      <span className="difficulty-title">Easy</span>
                    </div>
                    <div className="difficulty-details">
                      <p>• Smaller 10x10 board</p>
                      <p>• Fewer ships to manage</p>
                      <p>• Great for learning</p>
                    </div>
                  </div>
                </label>

                <label className={`difficulty-option ${difficulty === '1' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="1"
                    checked={difficulty === '1'}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="difficulty-radio"
                  />
                  <div className="difficulty-card medium">
                    <div className="difficulty-header">
                      <span className="difficulty-icon">🟡</span>
                      <span className="difficulty-title">Medium</span>
                    </div>
                    <div className="difficulty-details">
                      <p>• Standard 15x15 board</p>
                      <p>• Balanced ship count</p>
                      <p>• Classic experience</p>
                    </div>
                  </div>
                </label>

                <label className={`difficulty-option ${difficulty === '2' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="2"
                    checked={difficulty === '2'}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="difficulty-radio"
                  />
                  <div className="difficulty-card hard">
                    <div className="difficulty-header">
                      <span className="difficulty-icon">🔴</span>
                      <span className="difficulty-title">Hard</span>
                    </div>
                    <div className="difficulty-details">
                      <p>• Large 20x20 board</p>
                      <p>• More ships to sink</p>
                      <p>• Ultimate challenge</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className={`start-game-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Creating Battle...
                  </>
                ) : (
                  <>
                    🚢 Start Battle
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="game-info">
            <h4 className="info-title">⚓ Battle Instructions:</h4>
            <ul className="info-list">
              <li>🎯 Choose your preferred difficulty level</li>
              <li>🚢 You'll arrange your fleet on the board</li>
              <li>⏳ Wait for an opponent to join your battle</li>
              <li>⚔️ Take turns attacking enemy positions</li>
              <li>🏆 First to sink all enemy ships wins!</li>
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

export default StartGame;
