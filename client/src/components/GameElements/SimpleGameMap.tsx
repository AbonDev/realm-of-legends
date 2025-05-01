import React, { useState } from 'react';
import { playClick } from '../../lib/soundEffects';

// Token type for the game map
export type MapToken = {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
  size: number;
  isPlayer: boolean;
};

interface SimpleGameMapProps {
  tokens?: MapToken[];
  onTokenMove?: (tokenId: string, newX: number, newY: number) => void;
  onAddToken?: (x: number, y: number) => void;
  mapWidth?: number;
  mapHeight?: number;
  gridSize?: number;
  background?: string;
}

const SimpleGameMap: React.FC<SimpleGameMapProps> = ({
  tokens = [],
  onTokenMove,
  onAddToken,
  mapWidth = 800,
  mapHeight = 600,
  gridSize = 40,
  background = '/textures/grass.jpg'
}) => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<[number, number] | null>(null);

  // Calculate grid dimensions
  const gridCols = Math.floor(mapWidth / gridSize);
  const gridRows = Math.floor(mapHeight / gridSize);

  // Handle token selection
  const handleTokenClick = (tokenId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClick();
    setSelectedToken(tokenId === selectedToken ? null : tokenId);
  };

  // Handle map click for token placement or movement
  const handleMapClick = (x: number, y: number, e: React.MouseEvent) => {
    if (e.button === 2 && onAddToken) {
      // Right click to add a new token
      e.preventDefault();
      onAddToken(x, y);
      return;
    }
    
    if (selectedToken && onTokenMove) {
      // Move the selected token
      onTokenMove(selectedToken, x, y);
      setSelectedToken(null);
    }
  };

  // Handle mouse move to track hovered cell
  const handleMouseMove = (e: React.MouseEvent) => {
    const mapRect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - mapRect.left) / gridSize);
    const y = Math.floor((e.clientY - mapRect.top) / gridSize);
    
    if (x >= 0 && x < gridCols && y >= 0 && y < gridRows) {
      setHoveredCell([x, y]);
    } else {
      setHoveredCell(null);
    }
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  // Prevent default context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="simple-game-map-container">
      <div className="simple-game-map-controls mb-2 flex justify-between items-center">
        <div className="font-semibold text-gray-200">
          Battle Map
        </div>
        <div className="text-sm text-gray-400">
          {selectedToken ? "Click on the map to move selected token" : "Click on a token to select it, right-click to add a new token"}
        </div>
      </div>

      <div 
        className="simple-game-map relative overflow-hidden border border-gray-700 rounded"
        style={{
          width: mapWidth,
          height: mapHeight,
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          position: 'relative',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {/* Grid */}
        <div className="grid-overlay absolute top-0 left-0 w-full h-full pointer-events-none">
          {Array.from({ length: gridCols }).map((_, col) => (
            <div 
              key={`col-${col}`}
              className="grid-line absolute top-0 bottom-0 border-l border-gray-600 opacity-30"
              style={{ left: col * gridSize }}
            />
          ))}
          {Array.from({ length: gridRows }).map((_, row) => (
            <div 
              key={`row-${row}`}
              className="grid-line absolute left-0 right-0 border-t border-gray-600 opacity-30"
              style={{ top: row * gridSize }}
            />
          ))}
        </div>

        {/* Clickable cells */}
        <div className="cells-layer absolute top-0 left-0 w-full h-full">
          {Array.from({ length: gridRows }).map((_, row) => (
            <div key={`cell-row-${row}`} className="flex">
              {Array.from({ length: gridCols }).map((_, col) => (
                <div
                  key={`cell-${col}-${row}`}
                  className="cell"
                  style={{
                    width: gridSize,
                    height: gridSize,
                    position: 'absolute',
                    top: row * gridSize,
                    left: col * gridSize,
                  }}
                  onClick={(e) => handleMapClick(col, row, e)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Hover indicator */}
        {hoveredCell && (
          <div
            className="hover-indicator absolute border-2 border-white bg-white bg-opacity-10 pointer-events-none"
            style={{
              top: hoveredCell[1] * gridSize,
              left: hoveredCell[0] * gridSize,
              width: gridSize,
              height: gridSize,
            }}
          />
        )}

        {/* Tokens */}
        {tokens.map((token) => (
          <div
            key={token.id}
            className={`token absolute cursor-pointer select-none transition-all duration-200 ${selectedToken === token.id ? 'ring-4 ring-yellow-400' : ''}`}
            style={{
              top: token.y * gridSize + (gridSize - token.size * gridSize) / 2,
              left: token.x * gridSize + (gridSize - token.size * gridSize) / 2,
              width: token.size * gridSize,
              height: token.size * gridSize,
              backgroundColor: token.color,
              borderRadius: '50%',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
            onClick={(e) => handleTokenClick(token.id, e)}
          >
            {token.isPlayer && (
              <span className="text-white font-bold text-lg">P</span>
            )}
          </div>
        ))}

        {/* Token labels */}
        {tokens.map((token) => (
          <div
            key={`label-${token.id}`}
            className="token-label absolute bg-gray-900 bg-opacity-75 px-2 py-0.5 rounded text-white text-xs whitespace-nowrap pointer-events-none"
            style={{
              top: token.y * gridSize - 18,
              left: token.x * gridSize + gridSize * token.size / 2,
              transform: 'translateX(-50%)',
              zIndex: 20,
            }}
          >
            {token.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleGameMap;
