import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ArrangeBoard({ gameId, token }) {
  const [shipRules, setShipRules] = useState([]);
  const [boardSize, setBoardSize] = useState([0, 0]);
  const [board, setBoard] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [placedShips, setPlacedShips] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:8000/api/game-rules/${gameId}/`, {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    .then(res => {
      setShipRules(res.data.ship_rules);
      setBoardSize(res.data.board_size);
      initBoard(res.data.board_size);
    })
    .catch(err => {
      console.error(err);
    });
  }, [gameId, token]);

  const initBoard = ([rows, cols]) => {
    const emptyBoard = Array.from({ length: rows }, () => Array(cols).fill(null));
    setBoard(emptyBoard);
  };

  const handleCellClick = (row, col) => {
    if (!selectedShip) return;

    const shipSize = selectedShip.size;

    // Validate horizontal placement
    if (col + shipSize > boardSize[1]) return;

    // Check if cells are empty
    for (let i = 0; i < shipSize; i++) {
      if (board[row][col + i]) return;
    }

    const newBoard = [...board];
    for (let i = 0; i < shipSize; i++) {
      newBoard[row][col + i] = selectedShip.name;
    }
    setBoard(newBoard);

    // Update placedShips
    setPlacedShips(prev => [...prev, {
      name: selectedShip.name,
      size: shipSize,
      start: [row, col],
      direction: 'H'
    }]);

    // Reduce available count
    setShipRules(prev =>
      prev.map(ship =>
        ship.name === selectedShip.name
          ? { ...ship, count: ship.count - 1 }
          : ship
      )
    );

    setSelectedShip(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">🛠 Arrange Your Board</h2>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">Available Ships:</h3>
        <div className="flex gap-2 flex-wrap">
          {shipRules.map((ship, idx) => (
            <button
              key={idx}
              disabled={ship.count <= 0}
              className={`px-2 py-1 rounded border ${
                selectedShip?.name === ship.name
                  ? 'bg-purple-500 text-white'
                  : 'bg-white'
              } ${ship.count <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-100'}`}
              onClick={() => setSelectedShip(ship)}
            >
              {ship.name} ({ship.size}) x{ship.count}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-1 mb-4" style={{
        gridTemplateColumns: `repeat(${boardSize[1]}, 32px)`
      }}>
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              className={`w-8 h-8 border border-gray-400 cursor-pointer flex items-center justify-center ${
                cell ? 'bg-purple-400 text-white' : 'bg-blue-100'
              }`}
            >
              {cell ? '🚢' : ''}
            </div>
          ))
        )}
      </div>

      <pre className="bg-gray-100 p-2 text-xs mt-4">
        {JSON.stringify(placedShips, null, 2)}
      </pre>
    </div>
  );
}

export default ArrangeBoard;
