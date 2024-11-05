import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
function FEN({ event }) {
  const [game, setGame] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrowColor, setArrowColor] = useState("rgba(255, 0, 0, 0.7)");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("rgba(255, 0, 0, 0.5)");
  const [gameOutcome, setGameOutcome] = useState(null);
  const [movesHistory, setMovesHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [whitePlayer, setWhitePlayer] = useState('');
  const [blackPlayer, setBlackPlayer] = useState('');
  const [annotator, setAnnotator] = useState('');
  const [specificComment, setSpecificComment] = useState('');

  const [movesVisible, setMovesVisible] = useState(false);
  const [storedMoves, setStoredMoves] = useState([]); 
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); 

  useEffect(() => {
    if (!game) {
      const newGame = new Chess();
      setGame(newGame);
      setGameOutcome(null);
      setMovesHistory([]);
      setSelectedSquare(null);
    }
  }, [game]);

  useEffect(() => {
    if (event) {
      const fenMatch = event.match(/FEN "([^"]+)"/);
      if (fenMatch && fenMatch[1]) {
        const fen = fenMatch[1];
        const newGame = new Chess(fen);
        setGame(newGame);
      }

      const titleMatch = event.match(/\[Event "([^"]+)"\]/);
      if (titleMatch && titleMatch[1]) {
        setEventTitle(titleMatch[1]);
      }

      const whiteMatch = event.match(/\[White "([^"]+)"\]/);
      if (whiteMatch && whiteMatch[1]) {
        setWhitePlayer(whiteMatch[1]);
      }

      const blackMatch = event.match(/\[Black "([^"]+)"\]/);
      if (blackMatch && blackMatch[1]) {
        setBlackPlayer(blackMatch[1]);
      }

      const annotatorMatch = event.match(/\[Annotator "([^"]+)"\]/);
      if (annotatorMatch && annotatorMatch[1]) {
        setAnnotator(annotatorMatch[1]);
      }

      const specificCommentMatch = event.match(/\{([^}]+)\}/);
      if (specificCommentMatch && specificCommentMatch[1]) {
        setSpecificComment(specificCommentMatch[1]);
      } else {
        setSpecificComment('');
      }

      const movesMatch = event.match(/(\d+\.\s*[^\[\]]+)/g);
      if (movesMatch) {
        const formattedMoves = movesMatch.map(move => move.trim()).slice(1); // Discarding the first move
        setStoredMoves(formattedMoves); 
        setMovesHistory(formattedMoves);
      } else {
        setStoredMoves([]);
      }
    }
  }, [event]);

  const playMove = (move) => {
    const moveObj = game.move(move);
    if (moveObj) {
      setGame(new Chess(game.fen()));
      setCurrentMoveIndex((prevIndex) => prevIndex + 1);
      determineGameOutcome();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        if (currentMoveIndex > 0) {
          setCurrentMoveIndex((prevIndex) => prevIndex - 1);
          const move = storedMoves[currentMoveIndex - 1];
          playMove(move);
        }
      } else if (event.key === "ArrowRight") {
        if (currentMoveIndex < storedMoves.length) {
          const move = storedMoves[currentMoveIndex];
          playMove(move);
          setCurrentMoveIndex((prevIndex) => prevIndex + 1);
        }
      } else {
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMoveIndex, storedMoves]);

  const onDrop = (source, target) => {
    let move = null;
    setGame((game) => {
      const update = { ...game };
      move = update.move({
        from: source,
        to: target,
        promotion: 'q',
      });
      return update;
    });
    if (move === null) return false;
    updateMovesHistory(game);
    determineGameOutcome();
    return true;
  };

  const onSquareClick = (square) => {
    setSelectedSquare(square);
    toggleSquareHighlight(square);
  };

  const toggleSquareHighlight = (square) => {
    setHighlightedSquares((prev) => {
      const existingHighlight = prev.find(highlight => highlight.square === square);
      if (existingHighlight) {
        return prev.filter(highlight => highlight.square !== square);
      }
      return [...prev, { square, color: currentHighlightColor }];
    });
  };

  const renderHighlightedSquares = () => {
    const highlightedStyles = {};
    highlightedSquares.forEach(({ square, color }) => {
      highlightedStyles[square] = {
        backgroundColor: color,
        opacity: 0.5,
      };
    });
    return highlightedStyles;
  };

  const resetHighlights = () => {
    setHighlightedSquares([]);
  };

  function determineGameOutcome() {
    if (game && game.in_checkmate()) {
      setGameOutcome('Checkmate!');
    } else if (game && (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition())) {
      setGameOutcome('The game is a draw!');
    } else {
      setGameOutcome(null);
    }
  }

  const toggleMovesVisibility = () => {
    setMovesVisible((prev) => !prev);
  };

  return (
    <div className="bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <h3 className="text-xl font-semibold mb-2 text-center">Event</h3>
      <div className="flex flex-col md:flex-row bg-white p-3 rounded-md shadow-md border border-gray-300">
        <div className="flex-1 flex items-center justify-center rounded-lg p-2">
          {game && (
            <div className="flex items-center justify-center border-8 border-gray-400 h-auto w-full p-2">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                style={{ width: "750px" }}
                customArrowColor={arrowColor}
                customSquareStyles={renderHighlightedSquares()}
                onSquareClick={onSquareClick}
                customNotationStyle={{
                  fontSize: "20px",
                }}
              />
            </div>
          )}
        </div>

        <div className="flex-1 p-4">
          <h4 className="font-semibold mb-2 text-4xl text-blue-600">Event Details:</h4>
          <p className="mb-2 text-xl">
            <strong className="text-2xl font-bold">Topic:</strong> {whitePlayer} vs {blackPlayer}
          </p>
          <p className="mb-2 text-xl">
            <strong>Annotator:</strong> {annotator}
          </p>
          <div className="border border-gray-300 rounded-md p-2 mt-4">
            <h1 className="font-bold mb-2 text-2xl"><strong>Question:</strong></h1>
            <pre className="whitespace-pre-wrap text-gray-700 text-xl font-semibold max-w-full break-words">
              {specificComment}
            </pre>
          </div>
          {storedMoves.length > 0 && (
            <button
              onClick={toggleMovesVisibility}
              className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
            >
              {movesVisible ? "Hide Moves" : "Show Moves"}
            </button>
          )}
          {movesVisible && (
            <ul className="list-disc pl-5 mt-2">
              {movesHistory.map((move, index) => (
                <li key={index}>{move}</li>
              ))}
            </ul>
          )}
          <button
            onClick={resetHighlights}
            className="mt-4 bg-red-500 text-white p-2 ml-4 rounded hover:bg-red-600 transition duration-200"
          >
            Reset Highlights
          </button>
        </div>
      </div>
    </div>
  );
}
export default FEN;
