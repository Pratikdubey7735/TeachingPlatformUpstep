import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useLocation } from 'react-router-dom';

function Play() {
  const location = useLocation();
  const initialFen = location.state?.fen || 'start';
  const [game, setGame] = useState(() => new Chess(initialFen));
  const [fen, setFen] = useState(game.fen());
  const [movementHistory, setMovementHistory] = useState([]);
  const [presentMoveIndex, setPresentMoveIndex] = useState(0);
  const [sandboxGame, setSandboxGame] = useState(() => new Chess(initialFen));
  const [promotionPiece, setPromotionPiece] = useState('q');

  useEffect(() => {
    setFen(sandboxGame.fen());
  }, [sandboxGame]);

  const onDrop = (source, target) => {
    const move = sandboxGame.move({
      from: source,
      to: target,
      promotion: promotionPiece,
    });

    if (move) {
      const updatedHistory = [
        ...movementHistory.slice(0, presentMoveIndex),
        move.san,
      ];
      setMovementHistory(updatedHistory);
      setPresentMoveIndex(updatedHistory.length);
      setFen(sandboxGame.fen());
      return true;
    }
    return false;
  };

  const handleMoveClick = (index) => {
    setPresentMoveIndex(index + 1);
    const tempGame = new Chess(initialFen);
    for (let i = 0; i <= index; i++) {
      tempGame.move(movementHistory[i]);
    }
    setSandboxGame(tempGame);
  };

  const handlePreviousMove = () => {
    if (presentMoveIndex > 0) {
      handleMoveClick(presentMoveIndex - 2);
    }
  };

  const handleNextMove = () => {
    if (presentMoveIndex < movementHistory.length) {
      handleMoveClick(presentMoveIndex);
    }
  };

  const hisMovesMoves = () => {
    const userMoves = [];
    for (let i = 0; i < movementHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = movementHistory[i] || '...';
      const blackMove = movementHistory[i + 1] || '...';
      userMoves.push({
        text: `${moveNumber}. ${whiteMove} ${blackMove}`,
        index: i,
      });
    }
    return userMoves;
  };

  const userMoves = hisMovesMoves();

  // Add keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        handlePreviousMove();
      } else if (event.key === 'ArrowRight') {
        handleNextMove();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [presentMoveIndex, movementHistory]);

  return (
    <div className="flex justify-center items-center bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        {/* Left Part: Chessboard */}
        <div className="border-8 border-green-200 p-4 h-full">
          {sandboxGame && (
            <div className="flex items-center justify-center border-8 border-gray-600 h-auto w-full">
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                customNotationStyle={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "black",
                }} 
                boardOrientation="white"
              />
            </div>
          )}
        </div>

        {/* Right Part: Moves History */}
        <div className="rounded-lg shadow-md h-full flex flex-col">
          <div className="bg-white flex-1 border-8 border-blue-800 p-4 m-6">
            <h2 className="text-center font-bold text-xl mb-4">Moves History</h2>
            <ul className="list-none max-h-[550px] overflow-y-auto">
              {userMoves.map((move, index) => (
                <li
                  key={index}
                  className={`py-1 border-b border-gray-300 text-xl cursor-pointer ${
                    index === Math.floor(presentMoveIndex / 2)
                      ? 'bg-blue-200 font-bold'
                      : 'hover:bg-gray-200'
                  }`}
                  onClick={() => handleMoveClick(index)}
                >
                  {move.text}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <button
                onClick={handlePreviousMove}
                disabled={presentMoveIndex === 0}
                className="bg-gray-500 text-white py-1 px-4 rounded disabled:opacity-50 ml-8"
              >
                Previous
              </button>
              <button
                onClick={handleNextMove}
                disabled={presentMoveIndex === movementHistory.length}
                className="bg-gray-500 text-white py-1 px-4 rounded disabled:opacity-50 ml-8"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Play;
