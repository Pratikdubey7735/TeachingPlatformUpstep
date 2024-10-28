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
  
  // New state to manage the visibility of moves
  const [movesVisible, setMovesVisible] = useState(true); // Initially, moves are visible

  // Initialize a new game if not already set
  useEffect(() => {
    if (!game) {
      const newGame = new Chess();
      setGame(newGame);
      setGameOutcome(null);
      setMovesHistory([]);
      setSelectedSquare(null);
    }
  }, [game]);

  // Update game and event info when the 'event' prop changes
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

      // Extract moves while ignoring content inside square brackets []
      const movesMatch = event.match(/(\d+\.\s*[^\[\]]+)/g);
      if (movesMatch) {
        const formattedMoves = movesMatch.map((move, index) => (
          <li key={index} className="text-lg">
            {move.trim()}
          </li>
        ));
        setMovesHistory(formattedMoves);
      }
    }
  }, [event]);

  function onDrop(source, target) {
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
  }

  function onSquareClick(square) {
    setSelectedSquare(square);
    toggleSquareHighlight(square);
  }

  function toggleSquareHighlight(square) {
    setHighlightedSquares((prev) => {
      const existingHighlight = prev.find(
        (highlight) => highlight.square === square
      );

      if (existingHighlight) {
        return prev.filter((highlight) => highlight.square !== square);
      }

      return [...prev, { square, color: currentHighlightColor }];
    });
  }

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

  // Function to toggle visibility of moves
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
              />
            </div>
          )}
        </div>

        <div className="flex-1 p-4 ">
          <h4 className="font-semibold mb-2 text-4xl text-blue-600">
            Event Details:
          </h4>
          <p className="mb-2 text-xl">
            <strong className="text-2xl font-bold">Topic:</strong> {whitePlayer} vs {blackPlayer}
          </p>
          <p className="mb-2 text-xl">
            <strong>Annotator:</strong> {annotator}
          </p>
          <div className="border border-gray-300 rounded-md p-2 mt-4">
            <h1 className="font-bold mb-2 text-2xl">
              <strong>Question:</strong>
            </h1>
            <pre className="whitespace-pre-wrap text-gray-700 text-xl font-semibold max-w-full break-words">
              {specificComment}
            </pre>
          </div>
          <button
            onClick={toggleMovesVisibility}
            className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {movesVisible ? "Hide Moves" : "Show Moves"}
          </button>
          {movesVisible && (
            <>
              <h2 className="font-semibold mt-4 text-2xl">Moves:</h2>
              <ul className="list-disc ml-5">
                {movesHistory.map((move, index) => (
                  <li key={index} className="text-lg">{move}</li>
                ))}
              </ul>
            </>
          )}
          <button
            onClick={resetHighlights}
            className="mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition duration-200 m-4"
          >
            Reset Highlights
          </button>
        </div>
      </div>
    </div>
  );
}
export default FEN;
