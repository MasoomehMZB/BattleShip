import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import Board from "../GameBoard/Board";
import axios from "axios";
import "./GamePlay.css";

const GamePlay = ({ gameId=14 }) => {
  const navigate = useNavigate();
  const [playerShips, setPlayerShips] = useState([]);
  const [gameStatus, setGameStatus] = useState("Loading...");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [boardSize, setBoardSize] = useState();
  const [currentTurn, setCurrentTurn] = useState(null);
  const [username, setUsername] = useState("");
  const [importantMessage, setImportantMessage] = useState("");
  const [messageTimeout, setMessageTimeout] = useState(null);
  
  const playerBoardRef = useRef(null);
  const opponentBoardRef = useRef(null);
  const turnCheckIntervalRef = useRef(null);
  

  // Modify the useEffect to ensure proper loading sequence
  useEffect(() => {
    // First load game rules to get board size
    fetchGameRules()
      .then(() => fetchPlayerShips())
      .then(() => fetchCurrentUsername())
      .then(() => checkCurrentTurn())
      .catch(error => {
        console.error("Error in initialization sequence:", error);
        setErrorMessage("Failed to initialize game properly. Please refresh.");
      })
      .finally(() => {
        // Start polling for turn updates only after initial data is loaded
        turnCheckIntervalRef.current = setInterval(checkCurrentTurn, 5000);
      });
    
    // Cleanup interval on component unmount
    return () => {
      if (turnCheckIntervalRef.current) {
        clearInterval(turnCheckIntervalRef.current);
      }
      if (messageTimeout) {
        clearTimeout(messageTimeout);
      }
    };
  }, [gameId]);
  
  // Update fetchCurrentUsername to return a promise
  const fetchCurrentUsername = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await axios.get('http://localhost:8000/api/account/me/', {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      setUsername(response.data.username);
      return response.data.username; // Return the username for promise chaining
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  };
  
  // Update checkCurrentTurn to handle game over status
  const checkCurrentTurn = async () => {

    if (gameOver) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        return;
      }
      
      // Set a loading status while checking turn
     
      
      const response = await axios.get(`http://localhost:8000/api/games/${gameId}/turn/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      
      // Check if game is over
      if (response.data.message) {
        setGameOver(true);
        
        // Check if the winner is the current user
        const winnerUsername = response.data.winner;
        setWinner(winnerUsername);
        
        setGameStatus(response.data.message);
        
        // Stop polling for turns if game is over
        if (turnCheckIntervalRef.current) {
          clearInterval(turnCheckIntervalRef.current);
        }
        
        return;
      }
      
      // If game is not over, proceed with normal turn logic
      const turnUsername = response.data.username;
      setCurrentTurn(turnUsername);
      
      // Get current username if not already set
      const currentUsername = username || await fetchCurrentUsername();
      
      // Only update game status if there's no important message showing
      if (!importantMessage) {
        if (turnUsername === currentUsername) {
          setGameStatus("Your turn");
        } else if (currentUsername && turnUsername) {
          setGameStatus("Opponent's turn");
        } else {
          setGameStatus("Waiting for game to start...");
        }
      }
    } catch (error) {
      console.error("Error checking turn:", error);
      // Set a more informative message for initial load errors
      if (!currentTurn) {
        setGameStatus("Unable to determine turn status. Please refresh.");
      }
    }
  };
  
  // Convert fetchGameRules to return a promise for chaining
  const fetchGameRules = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");

        return Promise.reject("No authentication token");
      }
      
      const response = await axios.get(`http://localhost:8000/api/games/${gameId}/rules/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      

      setBoardSize(response.data.board_size);
      return Promise.resolve(response.data.board_size);
    } catch (error) {
      console.error("Error fetching game rules:", error);
      setErrorMessage("Failed to load game rules");
      return Promise.reject(error);
    }
  };
  
  // Convert fetchPlayerShips to return a promise for chaining
  const fetchPlayerShips = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        setLoading(false);

        return Promise.reject("No authentication token");
      }
      
      const response = await axios.get(`http://localhost:8000/api/games/${gameId}/ships/`, {
        headers: {
          Authorization: `Token ${token}`
        }
      });
      

      console.log("Player ships data:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setPlayerShips(response.data);
        setLoading(false);
        return Promise.resolve(response.data);
      } else {
        console.error("Invalid ship data format:", response.data);
        setErrorMessage("Received invalid ship data from server");
        setLoading(false);
        return Promise.reject("Invalid ship data format");
      }


    } catch (error) {
      console.error("Error fetching player ships:", error);
      setErrorMessage("Failed to load your ships. Please try refreshing the page.");
      setLoading(false);
      return Promise.reject(error);
    }
  };
  
  // Add this function to ensure boards are ready before accessing them
  const ensureBoardsReady = () => {
    return new Promise((resolve) => {
      // Check if board refs are available
      const checkRefs = () => {
        if (playerBoardRef.current?.gridRef?.current && 
            opponentBoardRef.current?.gridRef?.current) {
          resolve(true);
        } else {
          setTimeout(checkRefs, 100); // Check again in 100ms
        }
      };
      
      checkRefs();
    });
  };

  const handleCellAttack = async (x, y) => {
    try {
      // Check if it's the player's turn before allowing attack
      if (currentTurn !== username) {
        setErrorMessage("It's not your turn yet!");
        return;
      }
      
      setErrorMessage("");
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        return;
      }
      
      // Ensure board refs are ready before proceeding
      await ensureBoardsReady();
      
      const response = await axios.post(
        `http://localhost:8000/api/games/${gameId}/hit/`, 
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
            const sunkMessage = `You sunk a ship of size ${ship.size + 1}!`;
            showImportantMessage(sunkMessage, 7000); // Show for 7 seconds
          } else {
            setGameStatus(hit ? "Hit! Your turn again." : "Miss! Waiting for opponent...");
          }
        } else {
          console.error(`Cell reference not found at (${x}, ${y})`);
        }
        
        // Check turn after attack
        checkCurrentTurn();
      } 
      // Handle game over
      else if (response.status === 200 && response.data.message) {
        setGameOver(true);
        setWinner(response.data.winner);
        setGameStatus(response.data.message);
      
        // Update the opponent's board cell
        const cellRef = opponentBoardRef.current?.gridRef?.current[y]?.[x];
        if (cellRef) {
          cellRef.setStatus(response.data.hit ? "hit" : "miss");
          cellRef.setHidden(false);
        }
        
        // Stop polling for turns if game is over
        if (turnCheckIntervalRef.current) {
          clearInterval(turnCheckIntervalRef.current);
        }
      }
    } catch (error) {
      console.error("Error attacking cell:", error);
      if (error.response) {
        setErrorMessage(error.response.data.error || "An error occurred during your attack.");
        
        // Handle specific error cases
        if (error.response.status === 400 && error.response.data.error === "Not your turn.") {
          setGameStatus("Wait for your turn!");
          checkCurrentTurn(); // Refresh turn status
        }
      } else {
        //setErrorMessage("Network error. Please check your connection.");
      }
    }
  };
  
  // Custom handler for opponent board cell clicks
  const handleOpponentCellClick = (x, y) => {
    if (gameOver) return;
    handleCellAttack(x, y);
  };

  // Add this function to handle surrender
  const handleSurrender = async () => {
    try {
      // Confirm with the user before surrendering
      if (!window.confirm("Are you sure you want to surrender this game?")) {
        return;
      }
      
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found");
        return;
      }
      
      setLoading(true);
      
      // Changed from POST to GET
      const response = await axios.get(
        `http://localhost:8000/api/games/${gameId}/surrender/`,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );
      
      // Handle successful surrender
      if (response.status === 200) {
        setGameOver(true);
        setWinner(false); // You surrendered, so you lost
        setGameStatus("You surrendered. Game over.");
        
        // Stop polling for turns if game is over
        if (turnCheckIntervalRef.current) {
          clearInterval(turnCheckIntervalRef.current);
        }
      }
    } catch (error) {
      console.error("Error surrendering game:", error);
      if (error.response) {
        setErrorMessage(error.response.data.error || "An error occurred while surrendering.");
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (error.response.data.error === "Game is not in progress.") {
            setGameStatus("This game is already over.");
            checkCurrentTurn(); // Refresh game status
          } else if (error.response.data.error === "Not your turn.") {
            setErrorMessage("You can only surrender during your turn.");
          }
        } else if (error.response.status === 403) {
          setErrorMessage("You are not a player in this game.");
        }
      } else {
        setErrorMessage("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="game-play-container">
      <h2 className="game-status">
        {importantMessage || gameStatus}
      </h2>
      
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      
      <div className="game-controls">
        {!gameOver && (
          <button 
            className="surrender-button" 
            onClick={handleSurrender}
            disabled={loading}
          >
            Surrender
          </button>
        )}
      </div>
      
      <div className="boards-container">
        <div className="board-wrapper">
          <h3>Your Board</h3>
          <Board 
            ref={playerBoardRef}
            boardSize={boardSize}
            isCreating={false} // Read-only mode for player's own board
            shipPositions={playerShips}
            isPlayerBoard={true} // New prop to identify player's board
          />
        </div>
        
        <div className="board-wrapper">
          <h3>Opponent's Board</h3>
          <Board 
            ref={opponentBoardRef}
            boardSize={boardSize}
            isCreating={false} // Not in ship placement mode
            isOpponentBoard={true} // New prop to identify opponent's board
            onCellClick={handleOpponentCellClick} // Pass the click handler
          />
        </div>
      </div>
      
      {gameOver && (
        <div className="game-over-message">
          <button onClick={() => navigate('/game')}>
            Back to Games
          </button>
        </div>
      )}
      
      {loading && <div className="loading">Loading game data...</div>}
    </div>
  );
};

export default GamePlay;