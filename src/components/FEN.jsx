import React, { useState, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import { parse } from "pgn-parser";

function FEN({ event }) {
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
  const [questionVisible, setQuestionVisible] = useState(true);
  const [movesVisible, setMovesVisible] = useState(true); // New state for moves visibility

  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]); // PGN mainline moves
  const [variations, setVariations] = useState({}); // Stores variations as a tree structure
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentVariationIndex, setCurrentVariationIndex] = useState(null); // Track variation position
  const [isInVariation, setIsInVariation] = useState(false); // Track if user is navigating a variation
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [isBlackToMoveStart, setIsBlackToMoveStart] = useState(false);
  const [halfMoveOffset, setHalfMoveOffset] = useState(0); // Track offset for move numbering
  const [hasAutoMoved, setHasAutoMoved] = useState(false);
  const [eventKey, setEventKey] = useState(""); // Add eventKey to track changes

  // Complete reset of all game state when event changes
  useEffect(() => {
    // Reset all state variables
    resetGameState(event);
  }, [event]);

  // Function to completely reset the game state
  const resetGameState = (currentEvent) => {
    // Create a unique key for this event
    const newEventKey = Date.now().toString();
    setEventKey(newEventKey);
    
    // Reset board state
    setHighlightedSquares([]);
    setArrows([]);
    setSelectedSquare(null);
    setGameOutcome(null);
    
    // Reset variations and move indices
    setMoves([]);
    setVariations({});
    setCurrentMoveIndex(0);
    setCurrentVariationIndex(null);
    setIsInVariation(false);
    setHasAutoMoved(false);
    
    // Reset board orientation (optional - you may want to keep the current orientation)
    setBoardOrientation("white");

    // Initialize new game with FEN if available
    const newGame = new Chess();
    const fenMatch = currentEvent.match(/FEN \"([^\"]+)\"/);
    
    if (fenMatch && fenMatch[1]) {
      newGame.load(fenMatch[1]);
      
      // Check if Black to move in the starting position
      const blackToMove = fenMatch[1].split(" ")[1] === "b";
      setIsBlackToMoveStart(blackToMove);
      
      // Reset half move offset
      setHalfMoveOffset(0);
    } else {
      setIsBlackToMoveStart(false);
      setHalfMoveOffset(0);
    }
    
    setGame(newGame);
    
    // Parse metadata from the event
    parseEventMetadata(currentEvent);
    
    // Parse PGN moves
    parsePGN(currentEvent);
  };

  // Extract metadata from event
  const parseEventMetadata = (currentEvent) => {
    const titleMatch = currentEvent.match(/\[Event \"([^\"]+)\"\]/);
    if (titleMatch && titleMatch[1]) {
      setEventTitle(titleMatch[1]);
    } else {
      setEventTitle("");
    }
    
    const whiteMatch = currentEvent.match(/\[White \"([^\"]+)\"\]/);
    if (whiteMatch && whiteMatch[1]) {
      setWhitePlayer(whiteMatch[1]);
    } else {
      setWhitePlayer("");
    }
    
    const blackMatch = currentEvent.match(/\[Black \"([^\"]+)\"\]/);
    if (blackMatch && blackMatch[1]) {
      setBlackPlayer(blackMatch[1]);
    } else {
      setBlackPlayer("");
    }
    
    const annotatorMatch = currentEvent.match(/\[Annotator \"([^\"]+)\"\]/);
    if (annotatorMatch && annotatorMatch[1]) {
      setAnnotator(annotatorMatch[1]);
    } else {
      setAnnotator("");
    }
    
    const specificCommentMatch = currentEvent.replace(/\[[^\]]*\]/g, ""); // Remove all content inside square brackets
    setSpecificComment(specificCommentMatch);
  };

  // Auto-move effect for Black to move positions
  useEffect(() => {
    // Only execute if it's black to move at start and we haven't auto-moved yet
    if (isBlackToMoveStart && !hasAutoMoved && moves.length > 0) {
      // Wait a brief moment for the board to render before executing the move
      const timer = setTimeout(() => {
        handleNextMove();
        setHasAutoMoved(true);
      }, 300); // Short delay to ensure board is ready
      
      return () => clearTimeout(timer);
    }
  }, [isBlackToMoveStart, moves, hasAutoMoved]);

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

  useEffect(() => {
    const handleKeyNavigation = (event) => {
      if (event.key === "ArrowRight") {
        handleNextMove();
      } else if (event.key === "ArrowLeft") {
        handlePreviousMove();
      }
    };

    window.addEventListener("keydown", handleKeyNavigation);

    return () => {
      window.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [currentMoveIndex, isInVariation, currentVariationIndex]);

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

  const parsePGN = (pgn) => {
    try {
      const parsed = parse(pgn);
      if (parsed.length > 0 && parsed[0].moves) {
        const parsedMoves = parsed[0].moves.map((move) => ({
          san: move.move,
        }));

        const fen = pgn.match(/FEN \"([^\"]+)\"/)?.[1];
        const blackToMove = fen && fen.split(" ")[1] === "b";

        // Add placeholder if starting with Black's move
        if (blackToMove) {
          parsedMoves.unshift({
            san: "...",
            isBlackMove: true,
          });
        }

        // Add color information to each move
        const annotatedMoves = parsedMoves.map((move, index) => {
          const adjustedIndex = index + (blackToMove ? 1 : 0);
          return {
            ...move,
            isBlackMove: adjustedIndex % 2 === 1,
          };
        });

        setMoves(annotatedMoves);
        setCurrentMoveIndex(0);
      } else {
        // If no moves were parsed, ensure moves array is empty
        setMoves([]);
      }
    } catch (error) {
      console.error("Invalid PGN format:", error);
      setMoves([]);
    }
  };

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

    const isBlackMove = game.turn() === "w"; // After the move, the turn switches
    const newMove = {
      san: move.san,
      isBlackMove: isBlackMove,
    };

    // Check if the user is in a variation
    if (isInVariation) {
      // If in a variation, just add the move to the current variation
      if (!variations[currentMoveIndex]) {
        variations[currentMoveIndex] = [];
      }

      // Calculate the effective move number for this variation
      const effectiveMoveNumber =
        Math.floor((currentMoveIndex + halfMoveOffset) / 2) + 1;

      variations[currentMoveIndex].push({
        ...newMove,
        moveNumber: effectiveMoveNumber,
      });

      setVariations({ ...variations });
      setCurrentVariationIndex(variations[currentMoveIndex].length - 1);
    } else {
      // If not in a variation, check if move is part of the mainline
      if (currentMoveIndex < moves.length) {
        if (moves[currentMoveIndex].san === newMove.san) {
          // Move matches the mainline, proceed normally
          setCurrentMoveIndex(currentMoveIndex + 1);
        } else {
          // Move is a variation, store it and continue playing from it
          if (!variations[currentMoveIndex]) {
            variations[currentMoveIndex] = [];
          }

          // Calculate the effective move number for this variation
          const effectiveMoveNumber =
            Math.floor((currentMoveIndex + halfMoveOffset) / 2) + 1;

          variations[currentMoveIndex].push({
            ...newMove,
            moveNumber: effectiveMoveNumber,
          });

          setVariations({ ...variations });

          // Set current variation and allow further moves in this variation
          setIsInVariation(true);
          setCurrentVariationIndex(variations[currentMoveIndex].length - 1);
        }
      } else {
        // If at the end of stored moves, add the move to the mainline
        const newMoves = [...moves, newMove];
        setMoves(newMoves);
        setCurrentMoveIndex(newMoves.length);
      }
    }

    setGame(new Chess(game.fen())); // Update the board state
    return true;
  };

  const navigateToMove = (index, variationIndex = null) => {
    const newGame = new Chess();
    const fen = event.match(/FEN \"([^\"]+)\"/)?.[1];

    if (fen) {
      newGame.load(fen);
    }

    // Skip the "..." placeholder when replaying moves
    let skipFirst = isBlackToMoveStart ? 1 : 0;

    // Replay mainline moves up to the selected position
    for (let i = skipFirst; i < index && i < moves.length; i++) {
      if (moves[i].san !== "...") {
        try {
          newGame.move(moves[i].san);
        } catch (e) {
          console.error(`Error making move ${moves[i].san} at index ${i}:`, e);
        }
      }
    }

    // Apply variation move if specified
    if (
      variationIndex !== null &&
      variations[index] &&
      variations[index][variationIndex]
    ) {
      try {
        newGame.move(variations[index][variationIndex].san);
        setCurrentVariationIndex(variationIndex);
        setIsInVariation(true);
      } catch (e) {
        console.error(`Error making variation move:`, e);
        setCurrentVariationIndex(null);
        setIsInVariation(false);
      }
    } else {
      setCurrentVariationIndex(null);
      setIsInVariation(false);
    }

    setGame(newGame);
    setCurrentMoveIndex(index);
  };

  const handlePreviousMove = () => {
    if (
      isInVariation &&
      currentVariationIndex !== null &&
      currentVariationIndex > 0
    ) {
      // Move back within the variation
      navigateToMove(currentMoveIndex, currentVariationIndex - 1);
    } else if (isInVariation && currentVariationIndex === 0) {
      // Exit variation and go back to mainline
      navigateToMove(currentMoveIndex);
    } else if (!isInVariation && currentMoveIndex > 0) {
      // Move back in the mainline
      navigateToMove(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (isInVariation && variations[currentMoveIndex]) {
      if (currentVariationIndex + 1 < variations[currentMoveIndex].length) {
        // Move forward within the variation
        navigateToMove(currentMoveIndex, currentVariationIndex + 1);
        return;
      } else {
        // At the end of variation, go to next mainline move
        navigateToMove(currentMoveIndex + 1);
        return;
      }
    }

    if (!isInVariation && currentMoveIndex < moves.length) {
      // Move forward in the mainline
      navigateToMove(currentMoveIndex + 1);
    }
  };

  const getFormattedMove = (move, index, isMainline = true) => {
    // Adjust index for move number calculation
    const adjustedIndex = index + halfMoveOffset;
    const moveNumber = Math.floor(adjustedIndex / 2) + 1;
    const isBlackMove = adjustedIndex % 2 === 1;

    if (move.san === "...") {
      return `${moveNumber}...`;
    }

    if (isMainline) {
      if (!isBlackMove) {
        return `${moveNumber}. ${move.san}`;
      } else {
        return move.san;
      }
    } else {
      // For variations
      if (!isBlackMove) {
        return `${moveNumber}. ${move.san}`;
      } else {
        return `${moveNumber}... ${move.san}`;
      }
    }
  };

  const renderVariations = (index) => {
    if (!variations[index] || variations[index].length === 0) {
      return null;
    }

    return (
      <span className="text-gray-500">
        {" ("}
        {variations[index].map((variation, vIndex) => {
          // Calculate proper move number for this variation
          const baseIndex = index + halfMoveOffset;
          const moveNumber = Math.floor(baseIndex / 2) + 1;
          const isBlackMove = baseIndex % 2 === 1;

          // Format the move display correctly
          let displayText;
          if (vIndex === 0) {
            // First move in variation needs proper move number
            if (isBlackMove) {
              displayText = `${moveNumber}... ${variation.san}`;
            } else {
              displayText = `${moveNumber}. ${variation.san}`;
            }
          } else {
            // Calculate whether this is white or black to move
            const prevIsBlack = variations[index][vIndex - 1].isBlackMove;
            const thisIsBlack = variation.isBlackMove;

            // If switching from black to white, show move number
            if (prevIsBlack && !thisIsBlack) {
              const nextMoveNumber =
                moveNumber + Math.floor((vIndex + (isBlackMove ? 1 : 0)) / 2);
              displayText = `${nextMoveNumber}. ${variation.san}`;
            } else {
              displayText = variation.san;
            }
          }

          return (
            <span
              key={vIndex}
              className={`cursor-pointer ${
                currentVariationIndex === vIndex &&
                isInVariation &&
                currentMoveIndex === index
                  ? "font-bold text-red-500"
                  : "text-red-500"
              }`}
              onClick={() => navigateToMove(index, vIndex)}
            >
              {vIndex > 0 ? " " : ""}
              {displayText}
            </span>
          );
        })}
        {") "}
      </span>
    );
  };

  return (
    <div className="bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <div className="flex flex-col md:flex-row bg-white rounded-md shadow-md border border-gray-300">
        <div className="flex-none p-2 w-full md:w-1/2">
          {game && (
            <div className="flex items-center justify-center border-8 border-gray-400 h-auto w-full">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardOrientation={boardOrientation}
                customArrowColor={arrowColor}
                customArrows={arrows}
                customSquareStyles={renderHighlightedSquares()}
                onSquareClick={onSquareClick}
                customNotationStyle={{
                  fontSize: "25px",
                  fontWeight: "bold",
                  color: "black",
                }}
                key={eventKey} // Add key to force re-render on event change
              />
            </div>
          )}
        </div>
        <div className="flex-1 p-4 relative">
          {" "}
          {/* Add relative position */}
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
            
            {movesVisible && ( // Conditionally render moves based on movesVisible state
              <pre className="whitespace-pre-wrap text-gray-700 font-semibold break-words m-0 p-0 leading-tight mt-4 overflow-x-scroll max-w-[630px]">
                {moves.map((move, index) => {
                  // Determine proper move number based on actual half-moves
                  const adjustedIndex = index + halfMoveOffset;
                  const moveNumber = Math.floor(adjustedIndex / 2) + 1;
                  const isBlackMove = adjustedIndex % 2 === 1;

                  // Highlighting logic
                  const isHighlighted =
                    (!isInVariation && currentMoveIndex === index) ||
                    (isInVariation &&
                      currentMoveIndex === index &&
                      game.history().length === index);

                  // Skip the first empty move for black's start if needed
                  if (index === 0 && isBlackToMoveStart && move.san === "...") {
                    return (
                      <span key={index} className="mr-2">
                        <span className="text-gray-700">{moveNumber}...</span>
                        {renderVariations(index)}
                      </span>
                    );
                  }

                  return (
                    <span key={index} className="mr-2">
                      {/* Display move number for White's moves */}
                      {!isBlackMove && (
                        <span className="text-gray-700">{moveNumber}.</span>
                      )}

                      {/* Display the move itself */}
                      <span
                        className={`cursor-pointer ml-1 ${
                          isHighlighted ? "font-bold text-blue-600" : ""
                        }`}
                        onClick={() => navigateToMove(index)}
                      >
                        {move.san}
                      </span>

                      {/* Display any variations from this position */}
                      {renderVariations(index)}
                    </span>
                  );
                })}
              </pre>
            )}
          </div>
          {/* Buttons Container */}
          <div className="absolute bottom-4 left-8 right-0 flex gap-2 mb-2">
            <button
              onClick={resetHighlights}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
            >
              Reset Highlights
            </button>

            <button
              onClick={() =>
                setBoardOrientation(
                  boardOrientation === "white" ? "black" : "white"
                )
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200"
            >
              Flip Board
            </button>

            <button
              onClick={() => {
                setQuestionVisible(!questionVisible);
                setMovesVisible(!movesVisible); // Toggle moves visibility when hiding/showing event
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition duration-200"
            >
              {questionVisible ? "Hide" : "Show"} Event
            </button>

            <button
              onClick={handlePreviousMove}
              className="p-3 rounded-full text-lg bg-slate-400 hover:bg-blue-200 duration-100"
            >
              <HiArrowSmLeft />
            </button>

            <button
              onClick={handleNextMove}
              className="p-3 rounded-full text-lg bg-slate-400 hover:bg-blue-200 duration-100"
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
