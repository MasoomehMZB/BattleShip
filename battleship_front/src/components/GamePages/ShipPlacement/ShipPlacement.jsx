import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Board from "../GameBoard/Board.jsx";
import ShipRules from "../ShipRules/ShipRules";
import axios from "axios";
import "../../../styles/components/GamePages/ShipPlacement/ShipPlacement.css";

const ShipPlacement = () => {
  // Add navigate for redirection
  const navigate = useNavigate();
  
  // Extract gameId from URL parameters and isCreating from location state
  const { gameId } = useParams();
  const location = useLocation();
  const isCreating = location.state?.isCreating ?? true;
  
  // State variables
  const [boardSize, setBoardSize] = useState();
  const [placedShips, setPlacedShips] = useState([]);
  const [orientation, setOrientation] = useState("horizontal");
  const [selectedShip, setSelectedShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shipPositions, setShipPositions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [shipRules, setShipRules] = useState({});
  const [bothPlayersReady, setBothPlayersReady] = useState(false);

  // Ref for Board component
  const boardRef = useRef(null);

  // Calculate total required ships
  const getTotalRequiredShips = () => {
    return Object.values(shipRules).reduce((total, count) => total + count, 0);
  };

  // Check if all ships are placed
  const areAllShipsPlaced = () => {
    const totalRequired = getTotalRequiredShips();
    return placedShips.length === totalRequired && shipPositions.length === totalRequired;
  };

  // Handle ship placement
  const handleShipPlaced = (ship, x, y) => {
    setPlacedShips(prev => [...prev, ship.id]);
    setShipPositions(prev => [...prev, {
      size: ship.length - 1,
      start_x: x,
      start_y: y,
      is_vertical: orientation === "vertical"
    }]);
    setSelectedShip(null);
  };

  // Handle ship deletion
  const handleShipDelete = (shipId) => {
    const index = placedShips.indexOf(shipId);
    if (index !== -1) {
      const shipToDelete = shipPositions[index];
      
      setPlacedShips(prev => prev.filter(id => id !== shipId));
      setShipPositions(prev => prev.filter((_, i) => i !== index));

      if (selectedShip?.id === shipId) {
        setSelectedShip(null);
      }

      if (boardRef.current && boardRef.current.clearShipFromBoard) {
        boardRef.current.clearShipFromBoard(shipToDelete);
      }
    }
  };

  // Handle clear all ships
  const handleClearAllShips = () => {
    setPlacedShips([]);
    setShipPositions([]);
    setSelectedShip(null);
    
    if (boardRef.current && boardRef.current.clearAllShips) {
      boardRef.current.clearAllShips();
    }
  };

  // Toggle orientation
  const toggleOrientation = () => {
    setOrientation(prev => prev === "horizontal" ? "vertical" : "horizontal");
  };

  // Handle ship selection
  const handleShipSelect = (ship) => {
    if (!placedShips.includes(ship.id)) {
      setSelectedShip(ship);
    }
  };

// Add after handleGoToGamePlay
const handleBackToMainMenu = () => {
  if (window.confirm("Are you sure you want to return to the main menu? Your ship placements will be saved.")) {
    navigate('/game');
  }
};

  // Add this function to check if both players have boards
  const checkBothPlayersReady = async () => {
    const token = localStorage.getItem("token");
    if (!token || !gameId) return;

    try {
      const boardsResponse = await axios.get(`http://localhost:8000/api/games/${gameId}/boards-count/`, {
        headers: {
          Authorization: `Token ${token}`,
        }
      });
      
      setBothPlayersReady(boardsResponse.data.count === 2);
    } catch (error) {
      console.error("Error checking players ready status:", error);
    }
  };

  // Modified handleSubmitPlacements function
  const handleSubmitPlacements = () => {
    const token = localStorage.getItem("token");
    if (!token || !gameId) {
      console.error("No token or game ID found");
      return;
    }
    
    if (shipPositions.length === 0) {
      setSubmitError("No ships have been placed yet.");
      return;
    }

    if (!areAllShipsPlaced()) {
      const totalRequired = getTotalRequiredShips();
      const placed = placedShips.length;
      setSubmitError(`You must place all ships before submitting. Placed: ${placed}/${totalRequired} ships.`);
      return;
    }
    
    setSubmitting(true);
    setSubmitError(null);
    
    axios.post(`http://localhost:8000/api/games/${gameId}/board/`, 
      { ships: shipPositions },
      {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      }
    )
      .then((res) => {
        console.log("Board arrangement submitted successfully:", res.data);
        // Check if both players are ready after successful submission
        checkBothPlayersReady();
      })
      .catch((err) => {
        console.error("Error submitting board arrangement:", err);
        setSubmitError(err.response?.data?.error || "Failed to submit ship placements.");
        setSubmitting(err.response?.data?.arranged);
      });
  };

  // Navigate to GamePlay when placement is submitted
  const handleGoToGamePlay = () => {
    navigate(`/game-play/${gameId}/`);
  };

  // Fetch game rules on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !gameId) {
      console.error("No token or game ID found");
      return;
    }

    axios.get(`http://localhost:8000/api/games/${gameId}/rules/`, {
      headers: {
        Authorization: `Token ${token}`,
      }
    })
      .then((res) => {
        setBoardSize(res.data.board_size);
        setShipRules(res.data.ship_rules || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching game rules:", err);
        setLoading(false);
      });
  }, [gameId]);

  // Add useEffect for periodic checking
  useEffect(() => {
    if (submitting) {
      const interval = setInterval(checkBothPlayersReady, 2000);
      return () => clearInterval(interval);
    }
  }, [submitting, gameId]);

  if (loading) {
    return <div className="loading">Loading game data...</div>;
  }
  
  return (
    <div className="game-container">
      
      <div className="game-content">
        <h3>🏴‍☠️ Battleship Game</h3>
        <div className="game-left-panel">
          <div className="game-boards">
            <div className="player-board">
            
              <Board 
                ref={boardRef}
                boardSize={boardSize} 
                selectedShip={selectedShip}
                orientation={orientation}
                onShipPlaced={handleShipPlaced}
                isCreating={isCreating}
                shipPositions={shipPositions}
                placedShips={placedShips}
              />
            </div>
          </div>
        </div>
        
        {isCreating && (
          <div className="game-middle-panel">
            <div className="game-controls">
              <div className="controls-flex-container">
                <button onClick={toggleOrientation} className="orientation-button">
                  Orientation: {orientation === "horizontal" ? "Vertical" : "Horizontal"}
                </button>
                
                {placedShips.length > 0 && !submitting && (
                  <button 
                    onClick={handleClearAllShips} 
                    className="clear-all-button"
                  >
                    Clear All Ships
                  </button>
                )}
                
                <button 
                  onClick={handleSubmitPlacements} 
                  className="submit-button"
                  disabled={submitting || !areAllShipsPlaced()}
                >
                  {submitting ? "Submitted" : "Submit Ship Placements"}
                </button>                

                {selectedShip && (
                  <div className="selected-ship-info">
                    <p>Selected: {selectedShip.name}</p>
                    <p>Dimensions: 
                     {` ${selectedShip.length} × ${selectedShip.width }`}
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="submit-error">
                    {submitError}
                  </div>
                )}

                {submitting && (
                  <div className="placement-hint">
                    {" Click the below button to start playing."}
                  </div>
                )}

                {submitting && (
                  <div className="game-status">
                    {bothPlayersReady ? (
                      <button 
                        onClick={handleGoToGamePlay} 
                        className="go-to-game-button"
                      >
                        Go to Game
                      </button>
                    ) : (
                      <>
                        <div className="waiting-message">
                          Waiting for opponent to arrange their ships...
                        </div>
                        <button 
                          onClick={handleBackToMainMenu} 
                          className="back-to-menu-button"
                        >
                          Back to Main Menu
                        </button>
                      </>
                    )}
                  </div>
                )}

                {!areAllShipsPlaced() && shipPositions.length > 0 && (
                  <div className="placement-hint">
                    Place all ships before submitting your fleet arrangement.
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
        
        <div className="game-right-panel">
          {isCreating ? (
            <ShipRules 
              gameId={gameId} 
              onShipSelect={handleShipSelect}
              selectedShipId={selectedShip?.id}
              placedShips={placedShips}
              onShipDelete={handleShipDelete}
            />
          ) : (
            <ShipRules gameId={gameId} />
          )}
        </div>
      </div>    </div>
  );
};

export default ShipPlacement;