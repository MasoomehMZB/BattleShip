// src/Home.jsx
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>🏴‍☠️ Welcome to Battleship</h1>
      <button onClick={() => navigate('/login')} style={btnStyle}>Login</button>
      <button onClick={() => navigate('/register')} style={btnStyle}>Register</button>
      <button onClick={() => navigate('/game')} style={btnStyle}>Game Page</button>
    </div>
  );
}

const btnStyle = {
  margin: '10px',
  padding: '10px 20px',
  fontSize: '16px',
};

export default Home;
