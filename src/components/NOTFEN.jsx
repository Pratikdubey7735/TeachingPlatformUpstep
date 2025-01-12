import React, { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import { parse } from "pgn-parser";

function NOTFEN({ event }) {
  const [eventDetails, setEventDetails] = useState({});
  const [moves, setMoves] = useState([]);
  const [isVisible, setIsVisible]= useState(true);
  const [variations, setVariations] = useState({});
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [chess, setChess] = useState(new Chess());
  const [promotionPiece, setPromotionPiece] = useState("q");
  const [highlightedSquares, setHighlightedSquares] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [arrowColor, setArrowColor] = useState("rgba(255, 0, 0, 0.7)");
  const [currentHighlightColor, setCurrentHighlightColor] = useState(
    "rgba(255, 0, 0, 0.5)"
  );
  const [boardOrientation, setBoardOrientation] = useState("white");

  useEffect(() => {
    if (event) {
      setMoves([]);
      setVariations({});
      setCurrentMoveIndex(0);
      setChess(new Chess());
      extractEventDetails(event);
      parsePGN(event);
    }
  }, [event]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        handleNextMove();
      } else if (event.key === "ArrowLeft") {
        handlePreviousMove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMoveIndex, moves]);

  const extractEventDetails = (event) => {
    const detailsRegex = /\[([a-zA-Z]+)\s+\"([^\"]+)\"\]/g;
    const details = {};
    let match;
    while ((match = detailsRegex.exec(event)) !== null) {
      details[match[1]] = match[2];
    }
    setEventDetails(details);
  };

  const parsePGN = (pgn) => {
    try {
      // Parse PGN using pgn-parser
      const parsed = parse(pgn);
      if (parsed.length > 0 && parsed[0].moves) {
        const parsedMoves = parsed[0].moves.map((move) => ({
          san: move.move,
        }));
        setMoves(parsedMoves);
        setChess(new Chess());
        setCurrentMoveIndex(0);
      }
    } catch (error) {
      console.error("Invalid PGN format:", error);
    }
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
  const resetHighlights = () => {
    setHighlightedSquares([]);
    setArrows([]);
  };
  const flipBoard = () => {
    setBoardOrientation((prevOrientation) =>
      prevOrientation === "white" ? "black" : "white"
    );
  };

  const handleMove = (sourceSquare, targetSquare, piece) => {
    const promotion = piece[1]?.toLowerCase() ?? "q";
    const newChess = new Chess(chess.fen());
    const move = newChess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion,
    });

    if (move === null) {
      return false;
    }

    const moveIndex = currentMoveIndex + 1;
    const nextMove = moves[moveIndex];

    if (nextMove && move.san === nextMove.san) {
      setCurrentMoveIndex(moveIndex);
    } else {
      const variationMoves = variations[currentMoveIndex] || [];
      setVariations((prev) => ({
        ...prev,
        [currentMoveIndex]: [...variationMoves, move],
      }));
    }

    setChess(newChess);
    return true;
  };

  const handleNextMove = () => {
    if (currentMoveIndex < moves.length) {
      const newChess = new Chess(chess.fen());
      newChess.move(moves[currentMoveIndex].san);
      setChess(newChess);
      setCurrentMoveIndex((prev) => prev + 1);
    }
  };

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      const newChess = new Chess();
      for (let i = 0; i < currentMoveIndex - 1; i++) {
        newChess.move(moves[i].san);
      }
      setChess(newChess);
      setCurrentMoveIndex((prev) => prev - 1);
    }
  };

  const renderMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhiteMove = index % 2 === 0;
    const isPreviousMove = currentMoveIndex - 1 === index;

    return (
      <span
        key={index}
        className={`move-${index}`}
        style={{
          fontWeight: isPreviousMove ? "bold" : "normal",
          marginRight: "5px",
          cursor: "pointer",
          color: isPreviousMove ? "blue" : "black",
        }}
        onClick={() => {
          const newChess = new Chess();
          for (let i = 0; i <= index; i++) {
            newChess.move(moves[i].san);
          }
          setChess(newChess);
          setCurrentMoveIndex(index + 1);
        }}
      >
        {isWhiteMove ? `${moveNumber}. ${move.san}` : move.san}
      </span>
    );
  };

  const renderVariation = (variationMoves, parentIndex) => {
    let moveNumber = Math.floor(parentIndex / 2) + 1;
    let isWhiteMove = parentIndex % 2 === 0;

    return (
      <span
        style={{
          fontWeight: "bold",
          marginLeft: "5px",
          marginRight: "5px",
          color: "red",
        }}
      >
        (
        {variationMoves.map((move, index) => {
          const formattedMove = isWhiteMove
            ? `${moveNumber}. ${move.san}`
            : move.san;

          isWhiteMove = !isWhiteMove;
          if (isWhiteMove) moveNumber++;

          return (
            <span key={index} style={{ marginRight: "5px" }}>
              {formattedMove}
            </span>
          );
        })}
        )
      </span>
    );
  };


  

  return (
    <div className="bg-green-200 p-4 rounded-lg shadow-lg mb-4 w-full">
      <div className="flex bg-white rounded-md shadow-md border border-gray-300">
        {/* Left Container */}
        <div className="flex-none p-2" style={{ width: "50%" }}>
          <div className="flex items-center justify-center border-8 border-gray-400 h-auto w-full">
            <Chessboard
              position={chess.fen()}
              onSquareClick={(square) => toggleSquareHighlight(square)}
              customSquareStyles={renderHighlightedSquares()}
              customArrowColor={arrowColor}
              customArrows={arrows} // Define custom arrows if required
              boardOrientation={boardOrientation}
              onPieceDrop={handleMove}
              style={{ width: "750px" }}
              customNotationStyle={{
                fontSize: "25px",
                fontWeight: "bold",
                color: "black",
              }}
            />
          </div>
        </div>

        {/* Right Container */}
        <div className="flex-1 p-4"> 
          {isVisible && (
            <div className="p-4 border rounded-lg bg-gray-100 h-full overflow-y-scroll max-h-[650px]">
            {Object.keys(eventDetails).length > 0 && (
              <div className="mt-4 text-center">
                <h3 className="text-4xl font-bold text-gray-500">
                  Event Details:
                </h3>
                <p className="text-3xl font-semibold mt-4 text-blue-500">
                  {eventDetails.White || "N/A"} vs {eventDetails.Black || "N/A"}
                </p>
                <p className="text-2xl font-semibold mt-4">
                  Annotator: {eventDetails.Annotator || "N/A"}
                </p>
                <hr className="my-4 border-gray-400" />
              </div>
            )}
            <h3 className="text-lg font-bold mb-2">Game Details:</h3>
            <pre className="whitespace-pre-wrap">{event}</pre>
            <h3 className="text-lg font-bold mb-2">Moves:</h3>
            <div className="flex flex-wrap whitespace-nowrap overflow-x-auto bg-gray-50 p-2 rounded">
              {moves.map((move, index) => (
                <React.Fragment key={index}>
                  {renderMove(move, index)}
                  {variations[index] &&
                    renderVariation(variations[index], index)}
                </React.Fragment>
              ))}   
            </div>
          </div>
          )}
          
          <button
          className=" ml-5 mt-4 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition duration-200 pr-3 mr-4 mb-4"
          onClick={() => setIsVisible (!isVisible)}>
          {isVisible ? 'Hide' : 'Show'} Event
          </button>  
          <button
                onClick={resetHighlights}
                className="mt-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
              >
                Reset Highlights
              </button>

              <button
                onClick={flipBoard}
                className=" ml-5 mt-4 bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition duration-200"
              >
                Flip Board
              </button>
               <button className="p-2 m-3  rounded-full text-2xl bg-slate-400 hover:bg-blue-200 duration-100"
               onClick={handlePreviousMove}> <HiArrowSmLeft/> </button>
              <button className="p-2 m-3  rounded-full text-2xl bg-slate-400 hover:bg-blue-200 transition duration-200"
              onClick={handleNextMove}><HiArrowSmRight/></button>
        </div>
      </div>
    </div>
  );
}
export default NOTFEN;
