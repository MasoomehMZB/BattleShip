// src/pages/Game.jsx
import { useNavigate } from 'react-router-dom';

export default function Game() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Welcome to Battleship!</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '2rem auto' }}>
        <button onClick={() => navigate('/leaderboard')} style={buttonStyle}>Leader Board</button>
        <button onClick={() => navigate('/gameHistory')} style={buttonStyle}>My Game History</button>
        <button onClick={() => navigate('/my-active-games')} style={buttonStyle}>My Active Game</button>
        <button onClick={() => navigate('/start-game')} style={buttonStyle}>Start Game</button>
        <button onClick={() => navigate('/join-game')} style={buttonStyle}>Join Game</button>
        <button onClick={() => navigate('/edit-profile')} style={buttonStyle}>Edit Profile</button>
      </div>
    </div>
  );
}

const buttonStyle = {
  padding: '12px 20px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  cursor: 'pointer',
  backgroundColor: '#333333',
  transition: '0.2s ease-in-out',
};
