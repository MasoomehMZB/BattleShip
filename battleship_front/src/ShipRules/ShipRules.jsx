import React, { useEffect, useState } from 'react';
import axios from 'axios';
// Import the images
import ship1 from '../assets/ship-1.png';
import ship2 from '../assets/ship-1.png';
import ship3 from '../assets/ship-1.png';
import ship4 from '../assets/ship-1.png';
import ship5 from '../assets/ship-1.png';
import './ShipRules.css';

const ShipRules = ({ gameId, onShipSelect, selectedShipId, placedShips = [], onShipDelete }) => {
  const [shipRules, setShipRules] = useState({});
  const [boardSize, setBoardSize] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(`http://localhost:8000/api/game-rules/${gameId}/`, {
      headers: {
        Authorization: `Token ${token}`,
      }
    })
      .then((res) => {
        setShipRules(res.data.ship_rules || {});
        setBoardSize(res.data.board_size);
      })
      .catch((err) => {
        console.error("Error fetching game rules:", err);
        setShipRules({}); // Ensure shipRules is an empty object on error
      })
      .finally(() => {
        setLoading(false);
      });
  }, [gameId]);

  const handleShipClick = (size, index) => {
    if (onShipSelect) {
      const shipLength = parseInt(size) + 1;
      // Add width property for ships with length > 3
      const shipWidth = shipLength > 3 ? 2 : 1;
      
      onShipSelect({
        id: `${shipLength}-${index}`,
        name: `Ship ${shipLength}`,
        length: shipLength,
        width: shipWidth  
      });
    }
  };

  if (loading) return <p>Loading game rules...</p>;

  // Map of ship images
  const shipImages = {
    '0': ship1,
    '1': ship2,
    '2': ship3,
    '3': ship4,
    '4': ship5,
  };

  return (
    <div className="ship-rules-container">
      <h3>Game Rules</h3>
      <p>Board size: {boardSize} × {boardSize}</p>
      <div className="ship-rules-list">
        {Object.entries(shipRules || {}).map(([size, count]) => (
          <div key={size} className="ship-rule-item">
            <div className="ship-rule-header">
              <img
                src={shipImages[size] || ''}
                alt={`Ship size ${parseInt(size)+1}`}
                className="ship-image"
              />
              <p>Ship size {parseInt(size)+1} (×{count})</p>
            </div>
            <div className="ship-instances">
                {Array.from({ length: count }).map((_, index) => {
                const shipId = `${parseInt(size)+1}-${index}`;
                const isSelected = selectedShipId === shipId;
                const isPlaced = placedShips.includes(shipId);
                
                return (
                  <div key={index} className="ship-instance-container">
                    <button
                      className={`ship-instance ${isSelected ? 'selected' : ''} ${isPlaced ? 'placed' : ''}`}
                      onClick={() => handleShipClick(size, index)}
                      disabled={isPlaced}
                    >
                      {isPlaced ? '✓' : index + 1}
                    </button>
                    {isPlaced && onShipDelete && (
                      <button
                        className="delete-ship-instance-button"
                        onClick={() => {
                          // Validate ship exists before deletion
                          if (placedShips.includes(shipId)) {
                            onShipDelete(shipId);
                          } else {
                            console.warn(`Ship ${shipId} not found in placed ships`);
                          }
                        }}
                        title="Delete this ship placement"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipRules;
