import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function JoinGamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [joiningId, setJoiningId] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/games/waiting/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => setGames(res.data))
      .catch((err) => setError('❌ Failed to load games'));
  }, [token]);

  const handleJoin = (gameId) => {
    setJoiningId(gameId);
    axios
      .post(`http://localhost:8000/api/games/${gameId}/join/`, {}, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then(() => navigate(`/game/${gameId}`))
      .catch((err) => {
        setJoiningId(null);
        setError(err.response?.data?.error || 'Something went wrong');
      });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🎮 Join a Game</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {games.length === 0 ? (
        <p>No waiting games available at the moment.</p>
      ) : (
        <div className="space-y-4">
          {games.map((game) => (
            <div key={game.id} className="border rounded-xl p-4 shadow flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">👤 {game.creator}</p>
                <p className="text-sm text-gray-600">Difficulty: {game.difficulty}</p>
              </div>
              <button
                className={`px-4 py-2 rounded text-white ${
                  joiningId === game.id ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
                }`}
                onClick={() => handleJoin(game.id)}
                disabled={joiningId === game.id}
              >
                {joiningId === game.id ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default JoinGamePage;
