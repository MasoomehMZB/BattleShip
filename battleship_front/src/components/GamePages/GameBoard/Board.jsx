import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import BattleshipCell from "./BoardCell";
import "../../../styles/components/GamePages/GameBoard/Board.css";

// Modified Board component to support both ship placement and gameplay modes
const Board = forwardRef(({ 
  boardSize, 
  selectedShip, 
  orientation, 
  onShipPlaced,
  isCreating,
  shipPositions,
  // New props for gameplay
  isPlayerBoard = false,
  isOpponentBoard = false,
  onCellClick
}, ref) => {

  const gridRef = useRef([]);
  const [message, setMessage] = useState("");

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    clearShipFromBoard: (shipPosition) => {
      clearShipFromBoard(shipPosition);
    },
    clearAllShips: () => {
      clearAllShips();
    },
    // Add gridRef to allow GamePlay component to access cells directly
    gridRef: gridRef
  }));

  useEffect(() => {
    gridRef.current = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null));
  }, [boardSize]);

  // Function to clear a specific ship from the board
  const clearShipFromBoard = (shipPosition) => {
    if (!shipPosition || !isCreating) return;

    try {
      // Reconstruct ship object from position data
      const ship = { 
        length: shipPosition.size + 1, 
        width: shipPosition.size > 3 ? 2 : 1 
      };
      
      const shipOrientation = shipPosition.is_vertical ? "vertical" : "horizontal";
      const { shipLength, shipWidth } = getShipDimensions(ship, shipOrientation);
      
      // Clear each cell that was occupied by this ship
      for (let i = 0; i < shipLength; i++) {
        for (let j = 0; j < shipWidth; j++) {
          const clearX = shipPosition.start_x + i;
          const clearY = shipPosition.start_y + j;
          
          // Bounds checking
          if (clearX >= 0 && clearX < boardSize && clearY >= 0 && clearY < boardSize) {
            const cellRef = gridRef.current[clearY]?.[clearX];
            if (cellRef && cellRef.setOccupied) {
              cellRef.setOccupied(false);
            }
          }
        }
      }
      
      setMessage(`Ship removed successfully!`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Error clearing ship from board:", error);
      setMessage("Error removing ship from board");
    }
  };

  // Function to clear all ships from the board
  const clearAllShips = () => {
    if (!isCreating) return;

    try {
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          const cellRef = gridRef.current[y]?.[x];
          if (cellRef && cellRef.setOccupied) {
            cellRef.setOccupied(false);
          }
        }
      }
      setMessage("All ships cleared!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error clearing all ships:", error);
    }
  };

  // Effect to sync board state with ship positions
  useEffect(() => {
    // Only proceed if we have ship positions and this is the player's board
    // For opponent's board, we don't want to show ships

    if ((!isCreating && !isPlayerBoard) || !shipPositions) return;

    for (let y = 0; y < boardSize; y++) {
      for (let x = 0; x < boardSize; x++) {
        const cellRef = gridRef.current[y]?.[x];
        if (cellRef && cellRef.setOccupied) {
          cellRef.setOccupied(false);
        }
      }
    }

    // Re-place all ships based on current shipPositions
    shipPositions.forEach((shipPosition) => {
      try {
        const ship = { 
          length: shipPosition.size + 1, 
          width: shipPosition.size > 3 ? 2 : 1 
        };
        
        const shipOrientation = shipPosition.is_vertical ? "vertical" : "horizontal";
        const { shipLength, shipWidth } = getShipDimensions(ship, shipOrientation);
        
        for (let i = 0; i < shipLength; i++) {
          for (let j = 0; j < shipWidth; j++) {
            const placeX = shipPosition.start_x + i;
            const placeY = shipPosition.start_y + j;
            

            if (placeX >= 0 && placeX < boardSize && placeY >= 0 && placeY < boardSize) {
              const cellRef = gridRef.current[placeY]?.[placeX];
              if (cellRef && cellRef.setOccupied) {
                cellRef.setOccupied(true);
                
                // For player's board, always show ships
                if (isPlayerBoard) {
                  cellRef.setHidden(false);
                }
                
                // If the ship is sunk, update the cell status
                if (shipPosition.sunk) {
                  cellRef.setStatus("hit");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error re-placing ship:", error);
      }
    });
  }, [shipPositions, boardSize, isCreating, isPlayerBoard]);

  //Function to get ship dimensions based on orientation
  const getShipDimensions = (ship, orientation) => {
    let shipLength, shipWidth;
    if (orientation === "horizontal") {
      shipLength = ship.width || 1;
      shipWidth = ship.length;
    } else {
      shipLength = ship.length;
      shipWidth = ship.width || 1;
    }
    return { shipLength, shipWidth };
  };

  // Function to check if a ship can be placed at given coordinates
  const canPlaceShip = (x, y, ship) => {
    if (!isCreating) return false;
    
    if (!ship) {
      setMessage("Please select a ship first!");
      return false;
    }

    const { shipLength, shipWidth } = getShipDimensions(ship, orientation);

    if (x + shipLength > boardSize || y + shipWidth > boardSize) {
      setMessage("Ship placement out of bounds!");
      return false;
    }

    for (let i = 0; i < shipLength; i++) {
      for (let j = 0; j < shipWidth; j++) {
        const checkX = x + i;
        const checkY = y + j;
        
        const cellRef = gridRef.current[checkY]?.[checkX];
        if (cellRef && cellRef.isOccupied && cellRef.isOccupied()) {
          setMessage("Cannot place ship here - space already occupied!");
          return false;
        }
      }
    }

    return true;
  };

  // Function to place a ship on the board
  const placeShip = (x, y) => {
    if (!selectedShip) {
      setMessage("Please select a ship first!");
      return false;
    }

    const { shipLength, shipWidth } = getShipDimensions(selectedShip, orientation);
    
    if (!canPlaceShip(x, y, selectedShip)) {
      return false;
    }
    
    // Mark cells as occupied
    for (let i = 0; i < shipLength; i++) {
      for (let j = 0; j < shipWidth; j++) {
        const placeX = x + i;
        const placeY = y + j;
        
        const cellRef = gridRef.current[placeY]?.[placeX];
        if (cellRef && cellRef.setOccupied) {
          cellRef.setOccupied(true);
        }
      }
    }
    
    setMessage(`Ship placed successfully!`);
    setTimeout(() => setMessage(""), 3000);
    
    if (onShipPlaced) {
      onShipPlaced(selectedShip, x, y);
    }

    return true;
  };

  // Handle cell click from the cell component
  const handleCellClick = (x, y) => {
    // For ship placement mode (Game.jsx)
    if (isCreating) {
      placeShip(x, y);
    } 
    // For gameplay mode (GamePlay.jsx) - only allow clicks on opponent's board
    else if (isOpponentBoard && onCellClick) {
      onCellClick(x, y);
    }
  };

  // Set up a ref callback that doesn't trigger state updates
  const setCellRef = (x, y, cellRef) => {
    if (gridRef.current[y]) {
      gridRef.current[y][x] = cellRef;
    }
  };

  return (
    <div className="battleship-board-container">
      
      <div 
        className="battleship-board" 
        style={{ 
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`
        }}
      >
        {Array(boardSize).fill(null).map((_, y) => (
          Array(boardSize).fill(null).map((_, x) => (
            <div key={`${x}-${y}`}>
              <BattleshipCell 
                x={x} 
                y={y} 
                isCreating={isCreating}
                isPlayerBoard={isPlayerBoard}
                isOpponentBoard={isOpponentBoard}
                onClick={handleCellClick}
                ref={(cellRef) => setCellRef(x, y, cellRef)}
              />
            </div>
          ))
        ))}
      </div>

      {message && <div className="message">{message}</div>}
      
    </div>
  );
});

export default Board;