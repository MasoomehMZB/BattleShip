import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function MyActiveGames() {
  const [waitingGames, setWaitingGames] = useState([]);
  const [inProgressGames, setInProgressGames] = useState([]);
  const [onGoingGames, setOnGoingGames] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    axios.get('http://localhost:8000/api/games/history/', {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    .then(res => {
      const games = res.data;

      setWaitingGames(games.filter(game => game.status === 'Waiting'));
      setInProgressGames(games.filter(game => game.status === 'In Progress'));
      setOnGoingGames(games.filter(game => game.status === 'In Progress' || game.winner === null));

    })
    .catch(err => {
      console.error('Error fetching my games:', err);
    });
  }, []);

  const handleArrangeClick = (gameId, isCreator) => {
    navigate(`/ship-placement/${gameId}`, { state: { isCreator } });
  };

  const handlePlayClick = (gameId) => {
    navigate(`/game-play/${gameId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🎮 My Active Games</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">🕒 Waiting Games</h2>
        {waitingGames.length === 0 ? (
          <p className="text-gray-500">No waiting games at the moment.</p>
        ) : (
          <ul className="space-y-3">
            {waitingGames.map(game => (
              <li key={game.id} className="bg-gray-100 p-4 rounded shadow">
                Game #{game.id}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">🚀 In Progress Games</h2>
        {inProgressGames.length === 0 ? (
          <p className="text-gray-500">No games currently in progress.</p>
        ) : (
          <ul className="space-y-3">
            {inProgressGames.map(game => (
              <li key={game.id} className="bg-green-100 p-4 rounded shadow flex justify-between items-center">
                <span>Game #{game.id}</span>
                <button
                  onClick={() => handleArrangeClick(game.id, game.is_creator)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                >
                  Arrange Board
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">🎯 Ongoing Games</h2>
        {onGoingGames.length === 0 ? (
          <p className="text-gray-500">No ongoing games at the moment.</p>
        ) : (
          <ul className="space-y-3">
            {onGoingGames.map(game => (
              <li key={game.id} className="bg-blue-100 p-4 rounded shadow flex justify-between items-center">
                <span>Game #{game.id} {game.opponent ? `vs ${game.opponent}` : ''}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlayClick(game.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    Play Game
                  </button>
                  {game.status === 'In Progress' && (
                    <button
                      onClick={() => handleArrangeClick(game.id, game.is_creator)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                    >
                      Arrange Board
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default MyActiveGames;
