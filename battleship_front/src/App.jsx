// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Account/Login';      
import Register from './pages/Account/Register'; 
import GamePage from './pages/Game.jsx';
import Profile from './pages/Account/Profile';
import GameHistory from './pages/GamePages/GameHistory.jsx';
import StartGame from './pages/GamePages/StartGame.jsx';
import JoinGamePage from './pages/GamePages/JoinGame.jsx';
import MyActiveGames from './pages/GamePages/MyActiveGames.jsx';
import ShipRules from './pages/GamePages/ShipRules/ShipRules.jsx';
import ShipPlacement from './pages/GamePages/ShipPlacement/ShipPlacement.jsx';
import GamePlay from './pages/GamePages/GamePlay/GamePlay.jsx';
import Leaderboard from './pages/GamePages/Leaderboard.jsx';

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
        <Route path="/ship-rules/:gameId" element={<ShipRules />} />
        <Route path="/my-active-games" element={<MyActiveGames />} />
        <Route path="/ship-placement/:gameId" element={<ShipPlacement />} />
        <Route path="/game-play/:gameId" element={<GamePlay />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
