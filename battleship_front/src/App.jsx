// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Account/Login';      
import Register from './components/Account/Register'; 
import GamePage from './components/Game.jsx';
import Profile from './components/Account/Profile';
import EditProfile from './components/Account/EditProfile';
import GameHistory from './components/GamePages/GameHistory.jsx';
import StartGame from './components/GamePages/StartGame.jsx';
import JoinGamePage from './components/GamePages/JoinGame.jsx';
import MyActiveGames from './components/GamePages/MyActiveGames.jsx';
import ShipRules from './components/GamePages/ShipRules/ShipRules.jsx';
import ShipPlacement from './components/GamePages/ShipPlacement/ShipPlacement.jsx';
import GamePlay from './components/GamePages/GamePlay/GamePlay.jsx';
import Leaderboard from './components/GamePages/Leaderboard.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
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
