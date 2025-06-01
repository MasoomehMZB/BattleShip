import React, { useState, useImperativeHandle, forwardRef } from "react";
import "../../../styles/components/GamePages/GameBoard/BoardCell.css";

const BattleshipCell = forwardRef(({ 
  x, 
  y, 
  isCreating = false, 
  isPlayerBoard = false,
  isOpponentBoard = false,
  onClick 
}, ref) => {
  const [occupied, setOccupied] = useState(false);
  const [hidden, setHidden] = useState(true); // Hidden by default
  const [status, setStatus] = useState(null); // 'hit', 'miss', or null

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    isOccupied: () => occupied,
    setOccupied: (value) => setOccupied(value),
    setStatus: (value) => setStatus(value),
    setHidden: (value) => setHidden(value)
  }));

  const handleClick = () => {
    // Only allow clicks in ship placement mode or on opponent's board in gameplay mode
    if (isCreating || isOpponentBoard) {
      if (onClick) {
        onClick(x, y);
      }
    }
  };

  // Determine what to display in the cell
  const getCellContent = () => {
    // For hit or miss in gameplay
    if (status === "hit") {
      return "🔥"; // Show fire for hits
    } else if (status === "miss") {
      return "💦"; // Show water splash for misses
    }
    
    // For player's own board or creator mode, show ships if occupied
    if ((isPlayerBoard || isCreating) && occupied) {
      return "🚢"; // Show ship sticker for occupied cells
    }
    
    // Default for all other cells
    return "🌊"; // Show water for hidden or empty cells
  };

  // Determine cell class based on state
  const getCellClass = () => {
    let classes = "battleship-cell";
    
    // Hide cells on opponent's board unless they've been hit/missed
    if (isOpponentBoard && hidden && !status) {
      classes += " hidden";
    }
    
    if (status) {
      classes += ` ${status}`;
    }
    
    if (occupied && (isPlayerBoard || isCreating || !hidden)) {
      classes += " occupied";
    }
    
    // Make opponent's board cells clickable
    if (isOpponentBoard && !status) {
      classes += " clickable";
    }
    
    return classes;
  };

  return (
    <div
      className={getCellClass()}
      onClick={handleClick}
      data-x={x}
      data-y={y}
    >
      {getCellContent()}
    </div>
  );
});

export default BattleshipCell;
