import React, { useState, useImperativeHandle, forwardRef } from "react";
import "./BoardCell.css";

const BattleshipCell = forwardRef(({ x, y, isCreator = false, onClick }, ref) => {
  const [occupied, setOccupied] = useState(false);
  const [hidden, setHidden] = useState(!isCreator); // Hidden for opponent, visible for creator
  const [status, setStatus] = useState(null); // 'hit', 'miss', or null

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    isOccupied: () => occupied,
    setOccupied: (value) => setOccupied(value),
    setStatus: (value) => setStatus(value),
    setHidden: (value) => setHidden(value)
  }));

  const handleClick = () => {
    // For creator mode, delegate to parent component
    if (isCreator) {
      if (onClick) {
        onClick(x, y);
      }
      return;
    }
    
    // Opponent behavior: attack
    if (!hidden || status) return; // prevent multiple clicks or clicking visible cells
    
    if (occupied) {
      setStatus("hit");
    } else {
      setStatus("miss");
    }
    
    setHidden(false);
  };

  // Determine what to display in the cell
  const getCellContent = () => {
    if (hidden) {
      return "🌊"; // Show water for hidden cells
    }
    if (status === "hit") {
      return "🔥"; // Show fire for hits
    } else if (status === "miss") {
      return "💦"; // Show water splash for misses
    } else if (occupied) {
      return "🚢"; // Show ship sticker for occupied cells
    } else {
      return "🌊"; // Show sea sticker for unoccupied cells
    }
  };

  return (
    <div
      className={`battleship-cell ${hidden ? "hidden" : ""} ${status} ${occupied ? "occupied" : ""}`}
      onClick={handleClick}
      data-x={x}
      data-y={y}
    >
      {getCellContent()}
    </div>
  );
});

export default BattleshipCell;
