import React, { useEffect, useState } from 'react';
import ChessAnalysisBoard from 'react-chess-analysis-board';
import "../lib/style.scss";

function NOTFEN({ event }) {
  const [eventDetails, setEventDetails] = useState({});
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrowColor, setArrowColor] = useState('rgba(255, 0, 0, 0.7)');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('rgba(255, 0, 0, 0.5)');
  const [moveText, setMoveText] = useState('');

  useEffect(() => {
    if (event) {
      extractEventDetails(event);
      extractMoves(event);
    }
  }, [event]);

  const handleMouseClick = (square) => {
    setHighlightedSquares((prev) => {
      const existingHighlight = prev.find((h) => h.square === square);
      if (existingHighlight) {
        return prev.filter((h) => h.square !== square);
      } else {
        return [...prev, { square, color: currentHighlightColor }];
      }
    });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey) {
        setArrowColor("rgba(255, 0, 0, 0.7)");
        setCurrentHighlightColor("rgba(255, 0, 0, 0.5)");
      } else if (event.ctrlKey) {
        setArrowColor("rgba(0, 255, 0, 0.7)");
        setCurrentHighlightColor("rgba(0, 255, 0, 0.5)");
      } else if (event.shiftKey) {
        setArrowColor("rgba(0, 0, 255, 0.7)");
        setCurrentHighlightColor("rgba(0, 0, 255, 0.5)");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const extractEventDetails = (event) => {
    const detailsRegex = /\[([a-zA-Z]+)\s+"([^"]+)"\]/g;
    const details = {};
    let match;
    while ((match = detailsRegex.exec(event)) !== null) {
      details[match[1]] = match[2];
    }
    setEventDetails(details);
  };
  
  const extractMoves = (event) => {
    const movesRegex = /\{([^}]+)\}/g;
    const moves = [];
    let match;
    while ((match = movesRegex.exec(event)) !== null) {
      moves.push(match[1]);
    }
    setMoveText(moves.join('\n'));
  };

  const renderHighlightedSquares = () => {
    return highlightedSquares.map(({ square, color }) => ({
      square,
      style: { backgroundColor: color },
    }));
  };

  return (
    <div className="flex flex-col border-8 md:flex-row items-stretch justify-center bg--300 p-4">
      {/* Left Side: Chess Analysis Board */}
      <div className="flex-1 flex flex-col items-center bg-green-300 justify-center p-4 border-8 border-gray-400 rounded-lg mr-2 h-auto">
        {event && (
          <div className="w-full p-1">
            <div className="bg-gray-100 items-center rounded-lg shadow-lg large-chess-text">
              <ChessAnalysisBoard
                style={{ width: "950px" }}
                pgnString={event}
                customArrowColor={arrowColor}
                customSquareStyles={renderHighlightedSquares()}
                onSquareClick={handleMouseClick}
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Event Details and Raw Event Display */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 rounded-lg ml-2 h-auto overflow-auto max-h-[690px] border-8 border-blue-400">
        <div className="w-full bg-gray-100 p-2 rounded-lg shadow-lg">
        {Object.keys(eventDetails).length > 0 && (
          <div className="mt-4 text-center">
            <h3 className="text-2xl font-bold text-gray-500">Event Details:</h3>
            <p className="text-xl font-semibold mt-4 text-blue-500">
              {eventDetails.White || 'N/A'} vs {eventDetails.Black || 'N/A'}
            </p>
            <p className="text-xl mt-4 font-semibold">
              Annotator: {eventDetails.Annotator || 'N/A'}
            </p>
            <hr className="my-4 border-gray-400" />     
          </div>
        )}
          <h3 className="text-xl font-bold mb-2">Game Details:</h3>
          <pre className="whitespace-pre-wrap">{event}</pre>
        </div>
      </div>
    </div>
  );
}

export default NOTFEN;
