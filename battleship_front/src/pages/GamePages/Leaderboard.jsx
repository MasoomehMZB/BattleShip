import { useEffect, useState } from 'react';
import { getPlayers } from './Leaderboard.js';

function Leaderboard() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    getPlayers().then(data => setPlayers(data));
  }, []);

  return (
    <div>
      <h1>Leaderboard</h1>
      <ul>
        {players.map(player => (
          <li key={player.id}>{player.username}</li>
        ))}
      </ul>
    </div>
  );
}

export default Leaderboard;