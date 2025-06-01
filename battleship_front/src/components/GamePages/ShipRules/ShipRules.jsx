import React, { useEffect, useState } from 'react';
import axios from 'axios';

import ship1 from '../../../assets/ship-1.png';
import ship2 from '../../../assets/ship-2.png';
import ship3 from '../../../assets/ship-3.png';
import ship4 from '../../../assets/ship-4.png';
import ship5 from '../../../assets/ship-5.png';
import ship6 from '../../../assets/ship-6.png';

import '../../../styles/components/GamePages/ShipRules/ShipRules.css';

const ShipRules = ({ gameId, onShipSelect, selectedShipId, placedShips = [], onShipDelete }) => {
  const [shipRules, setShipRules] = useState({});
  const [boardSize, setBoardSize] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:8000/api/games/${gameId}/rules/`, {
      headers: {
        Authorization: `Token ${token}`,
      }
    })
      .then((res) => {
        setShipRules(res.data.ship_rules || {});
        setBoardSize(res.data.board_size);
        setError('');
      })
      .catch((err) => {
        console.error("Error fetching game rules:", err);
        setError("Failed to load game rules");
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
      const shipWidth = shipLength > 4 ? 2 : 1;
      
      onShipSelect({
        id: `${shipLength}-${index}`,
        name: `Ship ${shipLength}`,
        length: shipLength,
        width: shipWidth  
      });
    }
  };

  const handleDeleteClick = (shipId) => {
    if (onShipDelete && placedShips.includes(shipId)) {
      onShipDelete(shipId);
    }
  };

  const getShipProgress = () => {
    const totalShips = Object.values(shipRules).reduce((sum, count) => sum + count, 0);
    const placedCount = placedShips.length;
    return { placed: placedCount, total: totalShips };
  };

  const getShipTypeProgress = (size, count) => {
    const shipLength = parseInt(size) + 1;
    const placedOfThisType = placedShips.filter(shipId => 
      shipId.startsWith(`${shipLength}-`)
    ).length;
    return { placed: placedOfThisType, total: count };
  };

  if (loading) {
    return (
      <div className="ship-rules-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading game rules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ship-rules-container">
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Map of ship images
  const shipImages = {
    '0': ship1,
    '1': ship2,
    '2': ship3,
    '3': ship4,
    '4': ship5,
    '5': ship6,
  };

  const progress = getShipProgress();

  return (
    <div className="ship-rules-container">
      <div className="ship-rules-header">
        <h3 className="ship-rules-title">🚢 Fleet Configuration</h3>
        <div className="board-info">
          <span className="board-size">Board: {boardSize} × {boardSize}</span>
        </div>
        <div className="fleet-progress">
        <div className="progress-header">
          <span className="progress-label">Fleet Deployment Progress</span>
          <span className="progress-count">
            {progress.placed}/{progress.total} Ships Deployed
          </span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(progress.placed / progress.total) * 100}%` }}
          ></div>
        </div>
        {progress.placed === progress.total && (
          <div className="progress-complete">
            ✅ Fleet Ready for Battle!
          </div>
        )}
      </div>
      </div>



      <div className="ship-rules-list">
        {Object.entries(shipRules || {}).map(([size, count]) => {
          const shipLength = parseInt(size) + 1;
          const typeProgress = getShipTypeProgress(size, count);
          
          return (
            <div key={size} className="ship-rule-item">
              
                <div className="ship-info">
                  <img
                    src={shipImages[size-1] || ''}
                    alt={`Ship size ${shipLength}`}
                    className="ship-image"
                  />
                  <div className="ship-details">
                    <h4 className="ship-name">
                      {shipLength === 2 ? 'Destroyer' :
                       shipLength === 3 ? 'Submarine' :
                       shipLength === 4 ? 'Cruiser' :
                       shipLength === 5 ? 'Battleship' :
                       shipLength === 6 ? 'Carrier' : `Ship`}
                    </h4>
                    <p className="ship-description">
                      Size: {shipLength} cells • Quantity: {count}
                    </p>
                  </div>
                </div>
                <div className="ship-type-progress">
                  <span className="type-progress-text">
                    {typeProgress.placed}/{typeProgress.total}
                  </span>
                  {typeProgress.placed === typeProgress.total && (
                    <span className="type-complete">✅</span>
                  )}
                </div>
              

              <div className="ship-instances">
                {Array.from({ length: count }).map((_, index) => {
                  const shipId = `${shipLength}-${index}`;
                  const isSelected = selectedShipId === shipId;
                  const isPlaced = placedShips.includes(shipId);
                  
                  return (
                    <div key={index} className="ship-instance-container">
                      <button
                        className={`ship-instance ${isSelected ? 'selected' : ''} ${isPlaced ? 'placed' : ''}`}
                        onClick={() => handleShipClick(size, index)}
                        disabled={isPlaced}
                        title={isPlaced ? 'Ship deployed' : 'Click to select ship'}
                      >
                        {isPlaced ? '⚓' : index + 1}
                      </button>
                      {isPlaced && onShipDelete && (
                        <button
                          className="delete-ship-instance-button"
                          onClick={() => handleDeleteClick(shipId)}
                          title="Remove this ship from board"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ShipRules;
