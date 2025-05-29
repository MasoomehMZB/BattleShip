import React, { useState, useEffect, useRef } from "react";
import Board from "./GameBoard/Board";
import axios from "axios";
import "./GamePlay.css";

const GamePlay = ({ gameId=10 }) => {
  const [playerShips, setPlayerShips] = useState([]);
  const [gameStatus, setGameStatus] = useState("Your turn");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [boardSize, setBoardSize] = useState(10);
  
  const playerBoardRef = useRef(null);
  const opponentBoardRef = useRef(null);
  
  // Fetch player's ships on component mount
  useEffect(() => {
    fetchPlayerShips();
    fetchGameRules();
  }, [gameId]);
  
  const fetchGameRules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        return;
      }
      
      const response = await axios.get(`http://localhost:8000/api/games/${gameId}/rules/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setBoardSize(response.data.board_size || 10);
    } catch (error) {
      console.error("Error fetching game rules:", error);
      setErrorMessage("Failed to load game rules");
    }
  };
  
  const fetchPlayerShips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`http://localhost:8000/api/games/${gameId}/ships/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setPlayerShips(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching player ships:", error);
      setErrorMessage("Failed to load your ships. Please try refreshing the page.");
      setLoading(false);
    }
  };
  
  const handleCellAttack = async (x, y) => {
    try {
      setErrorMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        return;
      }
      
      const response = await axios.post(
        `http://localhost:8000/api/games/${gameId}/shots/`, 
        { x, y },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Handle successful hit or miss
      if (response.status === 201) {
        const { hit, ship } = response.data;
        
        // Update the opponent's board cell
        const cellRef = opponentBoardRef.current?.gridRef?.current[y]?.[x];
        if (cellRef) {
          cellRef.setStatus(hit ? "hit" : "miss");
          cellRef.setHidden(false);
          
          // If a ship was sunk, we might want to show it completely
          if (ship && ship.sunk) {
            setGameStatus(`You sunk a ship of size ${ship.size + 1}!`);
          } else {
            setGameStatus(hit ? "Hit! Your turn again." : "Miss! Waiting for opponent...");
          }
        }
      } 
      // Handle game over
      else if (response.status === 200 && response.data.message) {
        setGameOver(true);
        setWinner(response.data.winner);
        setGameStatus(response.data.message);
      }
    } catch (error) {
      console.error("Error attacking cell:", error);
      if (error.response) {
        setErrorMessage(error.response.data.error || "An error occurred during your attack.");
        
        // Handle specific error cases
        if (error.response.status === 400 && error.response.data.error === "Not your turn.") {
          setGameStatus("Wait for your turn!");
        }
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    }
  };
  
  // Custom handler for opponent board cell clicks
  const handleOpponentCellClick = (x, y) => {
    if (gameOver) return;
    handleCellAttack(x, y);
  };

  return (
    <div className="game-play-container">
      <h2 className="game-status">{gameStatus}</h2>
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      <div className="boards-container">
        <div className="board-wrapper">
          <h3>Your Board</h3>
          <Board 
            ref={playerBoardRef}
            boardSize={boardSize}
            isCreator={false} // Read-only mode for player's own board
            shipPositions={playerShips}
            isPlayerBoard={true} // New prop to identify player's board
          />
        </div>
        
        <div className="board-wrapper">
          <h3>Opponent's Board</h3>
          <Board 
            ref={opponentBoardRef}
            boardSize={boardSize}
            isCreator={false} // Not in ship placement mode
            isOpponentBoard={true} // New prop to identify opponent's board
            onCellClick={handleOpponentCellClick} // Pass the click handler
          />
        </div>
      </div>
      
      {gameOver && (
        <div className="game-over-message">
          <h2>{winner ? "You Won!" : "You Lost!"}</h2>
          <button onClick={() => window.location.href = "/games"}>
            Back to Games
          </button>
        </div>
      )}
      
      {loading && <div className="loading">Loading game data...</div>}
    </div>
  );
};

export default GamePlay;