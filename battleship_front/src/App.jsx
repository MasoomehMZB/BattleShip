// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';      
import Register from './pages/Register'; 
import GamePage from './pages/Game';
import Profile from './pages/Profile';
import GameHistory from './pages/GameHistory';
import StartGame from './pages/StartGame';
import JoinGamePage from './pages/JoinGame';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/GameHistory" element={<GameHistory />} />
        <Route path="/start-game" element={<StartGame />} />
        <Route path="/join-game" element={<JoinGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;
