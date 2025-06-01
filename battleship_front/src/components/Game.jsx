// src/pages/Game.jsx
import { useNavigate } from 'react-router-dom';
import '../styles/components/Game.css';

export default function Game() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="game-container">
      <div className="game-box">
        <h1 className="game-title">🏴‍☠️ Welcome to Battleship!</h1>
        
        <div className="button-container">
          <button onClick={() => navigate('/profile')} className="game-button profile-button">
            👤 Profile
          </button>
          <button onClick={() => navigate('/edit-profile')} className="game-button">
            ✏️ Edit Profile
          </button>
          <button onClick={() => navigate('/leaderboard')} className="game-button">
            🏆 Leader Board
          </button>          
          <button onClick={() => navigate('/gameHistory')} className="game-button">
            📜 My Game History
          </button>
          <button onClick={() => navigate('/my-active-games')} className="game-button">
            ⚔️ My Active Game
          </button>
          <button onClick={() => navigate('/start-game')} className="game-button">
            🚀 Start Game
          </button>
          <button onClick={() => navigate('/join-game')} className="game-button">
            ⚓ Join Game
          </button>
          <button onClick={handleLogout} className="game-button logout-button">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
