import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function FEN({ event }) {
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrowColor, setArrowColor] = useState("rgba(255, 0, 0, 0.7)");
  const [arrows, setArrows] = useState([]);
  const [currentHighlightColor, setCurrentHighlightColor] = useState(
    "rgba(255, 0, 0, 0.5)"
  );
  const [gameOutcome, setGameOutcome] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [annotator, setAnnotator] = useState("");
  const [specificComment, setSpecificComment] = useState("");
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [questionVisible, setQuestionVisible] = useState(true);

  const [moveHistory, setMoveHistory] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    if (event) {
      const fenMatch = event.match(/FEN \"([^\"]+)\"/);
      if (fenMatch && fenMatch[1]) {
        const fen = fenMatch[1];
        const newGame = new Chess(fen);
        setGame(newGame);
        setMoveHistory([]);
        setCurrentMoveIndex(0);
      }

      const titleMatch = event.match(/\[Event \"([^\"]+)\"\]/);
      if (titleMatch && titleMatch[1]) {
        setEventTitle(titleMatch[1]);
      }

      const whiteMatch = event.match(/\[White \"([^\"]+)\"\]/);
      if (whiteMatch && whiteMatch[1]) {
        setWhitePlayer(whiteMatch[1]);
      }

      const blackMatch = event.match(/\[Black \"([^\"]+)\"\]/);
      if (blackMatch && blackMatch[1]) {
        setBlackPlayer(blackMatch[1]);
      }

      const annotatorMatch = event.match(/\[Annotator \"([^\"]+)\"\]/);
      if (annotatorMatch && annotatorMatch[1]) {
        setAnnotator(annotatorMatch[1]);
      }

      const specificCommentMatch = event.replace(/\[[^\]]*\]/g, ""); // Remove all content inside square brackets
      setSpecificComment(specificCommentMatch);
    }
  }, [event]);

  const onDrop = (source, target, piece) => {
    const promotion = piece[1]?.toLowerCase() ?? "q";
    const move = game.move({
      from: source,
      to: target,
      promotion: promotion,
    });

    if (move === null) {
      return false; // Invalid move
    }

    const newHistory = moveHistory.slice(0, currentMoveIndex); // Truncate to current index for variations
    newHistory.push(move);
    setMoveHistory(newHistory);
    setCurrentMoveIndex(newHistory.length);
    setGame(new Chess(game.fen())); // Update the game state
    return true;
  };

  const navigateToMove = (index) => {
    const newGame = new Chess(); // Reset to the initial position
    const fen = event.match(/FEN \"([^\"]+)\"/)?.[1]; // Check if a custom FEN is provided
  
    if (fen) {
      newGame.load(fen); // Load the custom FEN if it exists
    }
  
    // Apply moves from the history up to the selected index
    moveHistory.slice(0, index).forEach((move) => newGame.move(move.san));
  
    setGame(newGame); // Update the chessboard state
    setCurrentMoveIndex(index); // Update the current move index
  };
  
  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      navigateToMove(currentMoveIndex - 1);
    }
  };
  
  const handleNextMove = () => {
    if (currentMoveIndex < moveHistory.length) {
      navigateToMove(currentMoveIndex + 1);
    }
  };
  

  const resetHighlights = () => {
    setHighlightedSquares([]);
    setArrows([]);
  };

  const onSquareClick = (square) => {
    setSelectedSquare(square);
    toggleSquareHighlight(square);
  };

  const toggleSquareHighlight = (square) => {
    setHighlightedSquares((prev) => {
      const existingHighlight = prev.find(
        (highlight) => highlight.square === square
      );
      if (existingHighlight) {
        return prev.filter((highlight) => highlight.square !== square);
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

  return (
    <div className="bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <h3 className="text-xl font-semibold mb-2 text-center">Event</h3>
      <div className="flex bg-white rounded-md shadow-md border border-gray-300">
        <div className="flex-none p-2" style={{ width: "50%" }}>
          {game && (
            <div className="flex items-center justify-center border-8 border-gray-400 h-auto w-full ">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                customSquareStyles={renderHighlightedSquares()}
                onSquareClick={onSquareClick}
              />
            </div>
          )}
        </div>
        <div className="flex-1 p-4">
          <div className="p-4 border rounded-lg bg-gray-100 h-full">
            <h4 className="font-semibold text-xl text-blue-600 select-none">
              Event Details:
            </h4>
            <p className="mb-2 select-none">
              <strong>Topic:</strong> {whitePlayer} vs {blackPlayer}
            </p>
            <p className="mb-2 select-none">
              <strong>Annotator:</strong> {annotator}
            </p>
            {questionVisible && (
              <pre className="whitespace-pre-wrap text-gray-700 font-semibold break-words m-0 p-0 leading-tight mt-4">
                {specificComment.replace(/\n\s*\n/g, "\n").trim()}
              </pre>
            )}
            <h4 className="font-semibold text-lg mt-4">Moves:</h4>
            <div className="overflow-x-auto bg-gray-50 p-2 rounded">
              {moveHistory.map((move, index) => (
                <span
                  key={index}
                  className={`cursor-pointer ${
                    index === currentMoveIndex - 1 ? "font-bold text-blue-600" : ""
                  }`}
                  style={{ marginRight: "5px" }}
                  onClick={() => navigateToMove(index + 1)}
                >
                  {index % 2 === 0 ? `${Math.floor(index / 2) + 1}.` : ""}
                  {move.san}{" "}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={resetHighlights}
            className="mt-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
          >
            Reset Highlights
          </button>
          <button
            onClick={() =>
              setBoardOrientation(boardOrientation === "white" ? "black" : "white")
            }
            className="ml-2 bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600 transition duration-200"
          >
            Flip Board
          </button>
          <button
            onClick={handlePreviousMove}
            className="ml-2 bg-gray-500 text-white px-4 py-1 rounded-full hover:bg-gray-600 transition duration-200"
          >
            Previous
          </button>
          <button
            onClick={handleNextMove}
            className="ml-2 bg-gray-500 text-white px-4 py-1 rounded-full hover:bg-gray-600 transition duration-200"
          >
            Next
          </button>
          <button
            onClick={() => setQuestionVisible(!questionVisible)}
            className="ml-2 bg-blue-500 text-white px-4 py-1 rounded-full hover:bg-blue-600 transition duration-200"
          >
            {questionVisible ? "Hide Question" : "Show Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FEN;
