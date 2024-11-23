import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";

function FEN({ event }) {
  const [game, setGame] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrowColor, setArrowColor] = useState("rgba(255, 0, 0, 0.7)");
  const [currentHighlightColor, setCurrentHighlightColor] = useState("rgba(255, 0, 0, 0.5)");
  const [gameOutcome, setGameOutcome] = useState(null);
  const [movesHistory, setMovesHistory] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [whitePlayer, setWhitePlayer] = useState("");
  const [blackPlayer, setBlackPlayer] = useState("");
  const [annotator, setAnnotator] = useState("");
  const [specificComment, setSpecificComment] = useState("");
  const [movesVisible, setMovesVisible] = useState(false);
  const [storedMoves, setStoredMoves] = useState([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [promotionPiece, setPromotionPiece] = useState('q');
  
  // Resizing states
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

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
        setSpecificComment("");
      }

      const cleanedEvent = event.replace(/\{[^}]*\}/g, "");
      const movesMatch = cleanedEvent.match(/^(?!\[).+/gm);
      if (movesMatch) {
        const formattedMoves = movesMatch.map((move) => move.trim());
        setStoredMoves(formattedMoves);
        setMovesHistory(formattedMoves);
      }
    }
  }, [event]);

  const resetHighlights = () => {
    setHighlightedSquares([]);
  };

  const buttonStyle = {
    margin: "10px",
    padding: "5px 10px",
    cursor: "pointer",
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        if (currentMoveIndex > 0) {
          setCurrentMoveIndex((prevIndex) => prevIndex - 1);
          const move = storedMoves[currentMoveIndex - 1];
          playMove(move); // Play the previous move
        }
      } else if (event.key === "ArrowRight") {
        if (currentMoveIndex < storedMoves.length) {
          const move = storedMoves[currentMoveIndex];
          playMove(move); // Play the next move
          setCurrentMoveIndex((prevIndex) => prevIndex + 1);
        }
      } else {
        // Existing key handling for highlighting colors
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

  const playMove = (move) => {
    const moveObj = game.move(move);
    if (moveObj) {
      setGame(new Chess(game.fen()));
      setCurrentMoveIndex((prevIndex) => prevIndex + 1);
      determineGameOutcome();
    }
  };

  const onDrop = (source, target, piece) => {
    const promotion = piece[1]?.toLowerCase() ?? 'q';
    let move = null;
    setGame((game) => {
      const update = { ...game };
      move = update.move({
        from: source,
        to: target,
        promotion: promotion,
      });
      return update;
    });
    if (move === null) return false;
    determineGameOutcome();
    return true;
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

  const hasValidMoves = movesHistory.some((move) => move !== "*");

  const toggleMovesVisibility = () => {
    setMovesVisible((prev) => !prev);
  };

  const determineGameOutcome = () => {
    if (game && game.in_checkmate()) {
      setGameOutcome("Checkmate!");
    } else if (
      game &&
      (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition())
    ) {
      setGameOutcome("The game is a draw!");
    } else {
      setGameOutcome(null);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newWidth = (e.clientX / window.innerWidth) * 100;
    setLeftWidth(Math.min(80, Math.max(20, newWidth))); // Limits width between 20% and 80%
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <h3 className="text-xl font-semibold mb-2 text-center">Event</h3>
      <div className="flex bg-white rounded-md shadow-md border border-gray-300">
        <div className="flex-none p-2" style={{ width: `${leftWidth}%` }}>
          {game && (
            <div className="flex items-center justify-center border-8 border-gray-400 h-auto w-full ">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                style={{ width: "750px" }}
                customArrowColor={arrowColor}
                customSquareStyles={renderHighlightedSquares()}
                onSquareClick={onSquareClick}
                customNotationStyle={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "black",
                }}                
              />
            </div>
          )}
        </div>
        <div
          className="flex-none bg-gray-300 w-1 cursor-col-resize"
          onMouseDown={handleMouseDown}
        ></div>
        <div className="flex-1 p-4">
          <h4 className="font-semibold mb-2 text-4xl text-blue-600 select-none">Event Details:</h4>
          <p className="mb-2 text-xl select-none">
            <strong className="text-2xl font-bold select-none">Topic:</strong> {whitePlayer} vs {blackPlayer}
          </p>
          <p className="mb-2 text-xl select-none">
            <strong>Annotator:</strong> {annotator}
          </p>
          <button
            onClick={() => setQuestionVisible((prev) => !prev)}
            className="bg-blue-500 text-white px-4 py-2 rounded-full mt-4"
          >
            {questionVisible ? "Hide Question" : "Show Question"}
          </button>
          {questionVisible && (
            <div className="border border-gray-300 rounded-md p-2 mt-4">
              <h1 className="font-bold mb-2 text-2xl select-none"><strong>Question:</strong></h1>
              <pre className="whitespace-pre-wrap text-gray-700 text-xl font-semibold max-w-full break-words overflow-y-auto max-h-60">
                {specificComment}
              </pre>
            </div>
          )}
           {hasValidMoves && (
            <div className="mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-full"
                onClick={toggleMovesVisibility}
              >
                {movesVisible ? "Hide Moves" : "Show Moves"}
              </button>
              {movesVisible && (
                <div className="mt-4">
                  <h4 className="text-xl font-semibold mb-2">Move History:</h4>
                  <div className="max-h-60 overflow-y-auto">
                    {storedMoves.map((move, index) => (
                      <div key={index} className="text-lg mb-2">
                        {move}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            onClick={resetHighlights}
            className="mt-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
          >
            Reset Highlights
          </button>
          <button
            className="bg-blue-500 rounded-2xl text-white"
            style={buttonStyle}
            onClick={() =>
              setBoardOrientation(boardOrientation === "white" ? "black" : "white")
            }
          >
            Flip board 🔁
          </button>
        </div>
      </div>
    </div>
  );
}
export default FEN;
