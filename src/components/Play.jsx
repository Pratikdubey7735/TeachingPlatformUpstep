import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useLocation } from 'react-router-dom';

function Play() {
  const location = useLocation();
  const initialFen = location.state?.fen || 'start';

  const [game] = useState(() => new Chess(initialFen));
  const [fen, setFen] = useState(game.fen());
  const [gameOutcome, setGameOutcome] = useState(null);
  const [movesHistory, setMovesHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [promotionPiece, setPromotionPiece] = useState('q'); // State to store selected promotion piece

  useEffect(() => {
    // Initialize moves history from the current game state
    setMovesHistory(game.history());
    setFen(game.fen());
  }, [game]);

  const onDrop = (source, target, piece) => {
    const promotion = piece[1]?.toLowerCase() ?? 'q'; // Default to queen if no promotion piece is specified

    const move = game.move({
      from: source,
      to: target,
      promotion: promotion, // Use selected promotion piece
    });

    if (move) {
      setFen(game.fen());
      updateMovesHistory();
      determineGameOutcome();
      return true;
    }
    return false;
  };

  const updateMovesHistory = () => {
    setMovesHistory(game.history());
    setCurrentMoveIndex(game.history().length);
  };

  const determineGameOutcome = () => {
    if (game.in_checkmate()) {
      setGameOutcome('Checkmate!');
    } else if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()) {
      setGameOutcome('The game is a draw!');
    } else {
      setGameOutcome(null);
    }
  };

  const formatMoves = () => {
    const formattedMoves = [];
    for (let i = 0; i < movesHistory.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = movesHistory[i];
      const blackMove = movesHistory[i + 1] ? movesHistory[i + 1] : '';
      formattedMoves.push({
        text: `${moveNumber}. ${whiteMove}   ${blackMove}`,
        index: i,
      });
    }
    return formattedMoves;
  };

  const handleMoveClick = (index) => {
    setCurrentMoveIndex(index + 1);
    setFen(getFenForMove(index + 1));
  };

  const getFenForMove = (moveIndex) => {
    const tempGame = new Chess(initialFen);
    for (let i = 0; i < moveIndex; i++) {
      tempGame.move(movesHistory[i]);
    }
    return tempGame.fen();
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
      setFen(getFenForMove(currentMoveIndex - 1));
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < movesHistory.length) {
      setCurrentMoveIndex(currentMoveIndex + 1);
      setFen(getFenForMove(currentMoveIndex + 1));
    }
  };

  const formattedMoves = formatMoves();

  return (
    <div className="flex justify-center items-center bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <div className="grid grid-cols-2 gap-4 w-full h-full">
        {/* Left Part: Chessboard */}
        <div className="border-8 border-green-200 p-4 h-full">
          {game && (
            <div className="flex items-center justify-center border-8 border-gray-600 h-auto w-full ">
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation="white"
                customNotationStyle={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "black",
                }}
              />
            </div>
          )}
        </div>
        
        {/* Right Part: Moves History */}
        <div className="rounded-lg shadow-md h-full flex flex-col">
          <div className="bg-white flex-1 border-8 border-blue-800 p-4 m-6">
            <h2 className="text-center font-bold text-xl mb-4">Moves History</h2>
            <ul className="list-none max-h-[550px] overflow-y-auto">
              {formattedMoves.map((move, index) => (
                <li
                  key={index}
                  className="py-1 border-b border-gray-300 text-xl cursor-pointer"
                  onClick={() => handleMoveClick(index)}
                >
                  {move.text}
                </li>
              ))}
            </ul>
            <div className='mt-2'>
              <button
                onClick={handlePreviousMove}
                disabled={currentMoveIndex === 0}
                className="bg-gray-500 text-white py-1 px-4 rounded disabled:opacity-50 ml-8"
              >
                Previous
              </button>
              <button
                onClick={handleNextMove}
                disabled={currentMoveIndex === movesHistory.length}
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
