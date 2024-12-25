import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import { Chess } from "chess.js";

function FEN({ event }) {
  const [game, setGame] = useState(new Chess());
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrowColor, setArrowColor] = useState("rgba(255, 0, 0, 0.7)");
  const [currentHighlightColor, setCurrentHighlightColor] = useState(
    "rgba(255, 0, 0, 0.5)"
  );
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
  const [promotionPiece, setPromotionPiece] = useState("q");
  const [userMoves, setUserMoves] = useState([]);
  const [userFENs, setUserFENs] = useState([new Chess().fen()]);
  const [arrows, setArrows] = useState([]);
  // Resizing states
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // Second Part swiper
  const [activePage, setActivePage] = useState(1); // 1 for Page 1, 2 for Page 2
  const goToPage = (page) => {
    setActivePage(page);
  };

  useEffect(() => {
    if (event) {
      const fenMatch = event.match(/FEN "([^"]+)"/);
      if (fenMatch && fenMatch[1]) {
        const fen = fenMatch[1];
        const newGame = new Chess(fen);
        setGame(newGame);
        setUserMoves([]); // Clear user move history
        setUserFENs([fen]); // Reset FEN history
        setCurrentMoveIndex(-1); // Reset user move index
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
    setHighlightedSquares([]);
    setArrows([]);
    setArrows([]);
  };

  const buttonStyle = {
    margin: "10px",
    padding: "5px 10px",
    cursor: "pointer",
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
  }, [currentMoveIndex, storedMoves]);

  const onDrop = (source, target, piece) => {
    const promotion = piece[1]?.toLowerCase() ?? "q";
    let move = null;
  
    setGame((game) => {
      const updatedGame = { ...game };
      move = updatedGame.move({
        from: source,
        to: target,
        promotion: promotion,
      });
      return updatedGame;
    });
  
    if (move === null) return false;
  
    if (currentMoveIndex === userMoves.length - 1) {
      // Handle appending white and black moves properly
      setUserMoves((prevMoves) => {
        if (prevMoves.length % 2 === 0) {
          // It's white's turn
          return [...prevMoves, move.san];
        } else {
          // It's black's turn
          return [...prevMoves, move.san];
        }
      });
      setUserFENs((prevFENs) => [...prevFENs, game.fen()]);
      setCurrentMoveIndex((prevIndex) => prevIndex + 1);
    } else {
      console.warn("Cannot add moves. User is not at the latest move index.");
    }
  
    determineGameOutcome();
    return true;
  };
  
  const playUserMove = (moveIndex) => {
    setGame(new Chess(userFENs[moveIndex]));
    setCurrentMoveIndex(moveIndex);
    determineGameOutcome();
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

  const formatMoveHistory = () => {
    const formatted = [];
    for (let i = 0; i < userMoves.length; i += 2) {
      const whiteMove = userMoves[i] || "..."; // Placeholder for missing white move
      const blackMove = userMoves[i + 1] || "..."; // Placeholder for missing black move
      formatted.push(`${Math.floor(i / 2) + 1}. ${whiteMove} ${blackMove}`);
    }
    return formatted;
  };
  

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
                customArrows={arrows}
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
          <div className="p-4 border rounded-lg bg-gray-100 h-full">
            {activePage === 1 ? (
              <div className="flex-1 p-4">
                <h4 className="font-semibold text-xl text-blue-600 select-none">
                  Event Details:
                </h4>
                <p className="mb-2 select-none">
                  <strong className="text-xl font-bold select-none">
                    Topic:
                  </strong>{" "}
                  {whitePlayer} vs {blackPlayer}
                </p>
                <p className="mb-2  select-none">
                  <strong>Annotator:</strong> {annotator}
                </p>
                <button
                  onClick={() => setQuestionVisible((prev) => !prev)}
                  className="bg-blue-500 text-white px-4 py-1 rounded-full mt-4"
                >
                  {questionVisible ? "Hide Question" : "Show Question"}
                </button>
                {questionVisible && (
                  <div className="border border-gray-300 rounded-md p-2 mt-4">
                    <h1 className="font-bold mb-2  select-none">
                      <strong>Question:</strong>
                    </h1>
                    <div className="overflow-auto max-h-40 max-w-full p-2 bg-gray-50 rounded-md select-none">
                      <pre className="whitespace-pre-wrap text-gray-700 font-semibold break-words">
                        {specificComment}
                      </pre>
                    </div>
                  </div>
                )}
                {hasValidMoves && (
                  <div className="mt-4">
                    <button
                      className="bg-blue-500 text-white px-4 py-1 rounded-full"
                      onClick={toggleMovesVisibility}
                    >
                      {movesVisible ? "Hide Moves" : "Show Moves"}
                    </button>
                    {movesVisible && (
                      <div className="mt-4">
                        <h4 className=" font-semibold mb-2">Move History:</h4>
                        <div className="overflow-auto max-h-40 p-2 bg-gray-50 rounded-md select-none">
                          {storedMoves.map((move, index) => (
                            <div key={index} className="mb-2">
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
                  className="mt-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
                >
                  Reset Highlights
                </button>
                <button
                  className="bg-blue-500 rounded-full text-white mt-1"
                  style={buttonStyle}
                  onClick={() =>
                    setBoardOrientation(
                      boardOrientation === "white" ? "black" : "white"
                    )
                  }
                >
                  Flip board 🔁
                </button>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-2 text-blue-600">Coach Move History</h2>
                <div className="mt-4">
                  <div className="flex justify-between mb-4">
                    <button
                      onClick={() => {
                        if (currentMoveIndex > 0) {
                          playUserMove(currentMoveIndex - 1);
                        }
                      }}
                      disabled={currentMoveIndex <= 0}
                      className={`bg-gray-200 text-gray-600 px-4 py-2 rounded ${
                        currentMoveIndex <= 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-300"
                      }`}
                    >
                      Previous Move
                    </button>
                    <button
                      onClick={() => {
                        if (currentMoveIndex < userFENs.length - 1) {
                          playUserMove(currentMoveIndex + 1);
                        }
                      }}
                      disabled={currentMoveIndex >= userFENs.length - 1}
                      className={`bg-gray-200 text-gray-600 px-4 py-2 rounded ${
                        currentMoveIndex >= userFENs.length - 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-300"
                      }`}
                    >
                      Next Move
                    </button>
                  </div>

                  <div className="overflow-auto max-h-40 bg-gray-50 p-2 rounded-md">
                    {formatMoveHistory().length > 0 ? (
                      formatMoveHistory().map((formattedMove, index) => (
                        <div
                          key={index}
                          className={`p-2 mb-1 rounded ${
                            index === Math.floor(currentMoveIndex / 2)
                              ? "bg-blue-200 font-bold" // Highlight current move pair
                              : "hover:bg-gray-200 cursor-pointer"
                          }`}
                          onClick={() => {
                            playUserMove(index * 2); // Navigate to the corresponding move index
                          }}
                        >
                          {formattedMove}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No moves made yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Icons */}
          <div className="flex justify-between items-center mt-4">
            {/* Left Arrow: Go to Page 1 */}
            <button
              onClick={() => goToPage(1)}
              disabled={activePage === 1}
              className={`text-4xl ${
                activePage === 1 ? "text-gray-400" : "text-blue-500"
              }`}
            >
              <HiArrowSmLeft />
            </button>

            {/* Right Arrow: Go to Page 2 */}
            <button
              onClick={() => goToPage(2)}
              disabled={activePage === 2}
              className={`text-4xl ${
                activePage === 2 ? "text-gray-400" : "text-blue-500"
              }`}
            >
              <HiArrowSmRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default FEN;
