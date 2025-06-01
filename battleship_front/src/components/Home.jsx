// src/Home.jsx
import { useNavigate } from 'react-router-dom';
import '../styles/components/Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="content-box">
        <h1 className="home-title">🏴‍☠️ Welcome to Battleship</h1>
        <div className="button-container">
          <button onClick={() => navigate('/login')} className="home-button">Login</button>
          <button onClick={() => navigate('/register')} className="home-button">Register</button>
        </div>
        {/* <button onClick={() => navigate('/profile')} className="home-button">Profile</button>
        <button onClick={() => navigate('/game')} className="home-button">Game Page</button> */}
      </div>
    </div>
  );
}

export default Home;
