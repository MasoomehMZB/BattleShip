import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StartGame() {
  const [difficulty, setDifficulty] = useState('0');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleStartGame = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token'); // Get auth token

    if (!token) {
      setMessage('❌ You must be logged in to start a game.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:8000/api/games/create/',
        { difficulty },
        {
          headers: {
            Authorization:`Token ${token}`,
          },
        }
      );

      setMessage('✅ Game created successfully!');
      // Optionally redirect:
      // navigate(`/game/${response.data.id}`);
    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(`❌ ${error.response.data.error}`);
      } else {
        setMessage('❌ Something went wrong.');
      }
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4 text-center">Start New Game</h2>

      {message && (
        <div className="mb-4 text-center text-sm font-medium text-red-600">
          {message}
        </div>
      )}

      <form onSubmit={handleStartGame}>
        <label className="block mb-2 font-medium">
          Choose Difficulty:
        </label>
        
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mb-4"
        >
          <option value="0">Easy</option>
          <option value="1">Medium</option>
          <option value="2">Hard</option>
        </select>
        <br />
        <br />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition"
        >
          Start Game
        </button>
      </form>
    </div>
  );
}

export default StartGame;
