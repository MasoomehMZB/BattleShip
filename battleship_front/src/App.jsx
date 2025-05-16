// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';      
import Register from './pages/Register'; 
import GamePage from './pages/Game';
import GameHistory from './pages/GameHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/GameHistory" element={<GameHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
