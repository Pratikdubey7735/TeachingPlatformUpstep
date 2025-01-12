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
  const [promotionPiece, setPromotionPiece] = useState("q");
  const [questionVisible, setQuestionVisible] = useState(true);

  useEffect(() => {
    if (event) {
      const fenMatch = event.match(/FEN \"([^\"]+)\"/);
      if (fenMatch && fenMatch[1]) {
        const fen = fenMatch[1];
        const newGame = new Chess(fen);
        setGame(newGame);
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
      return false; 
    }

    setGame(new Chess(game.fen())); 
    return true; 
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

  const buttonStyle = {
    margin: "10px",
    padding: "5px 10px",
    cursor: "pointer",
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
        <div className="flex-1 p-4">
          <div className="p-4 border rounded-lg bg-gray-100 h-full">
            <h4 className="font-semibold text-xl text-blue-600 select-none">
              Event Details:
            </h4>
            <p className="mb-2 select-none">
              <strong className="text-xl font-bold select-none">Topic:</strong>{" "}
              {whitePlayer} vs {blackPlayer}
            </p>
            <p className="mb-2 select-none">
              <strong>Annotator:</strong> {annotator}
            </p>
            {questionVisible && (
            <pre className="whitespace-pre-wrap text-gray-700 font-semibold break-words m-0 p-0 leading-tight mt-4">
              {specificComment.replace(/\n\s*\n/g, "\n").trim()}
            </pre>
            )}
          </div>
          <button
                  onClick={resetHighlights}
                  className="mt-4 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition duration-200"
                >
                  Reset Highlights
                </button>
                <button
              className="bg-blue-500 text-white px-4 py-1 rounded-full mt-4"
              style={buttonStyle}
              onClick={() =>
                setBoardOrientation(
                  boardOrientation === "white" ? "black" : "white"
                )
              }
            >
              Flip board 🔁
            </button>
            <button
                  onClick={() => setQuestionVisible((prev) => !prev)}
                  className="bg-blue-500 text-white px-4 py-1 rounded-full mt-4"
                >
                  {questionVisible ? "Hide Question" : "Show Question"}
                </button>
        </div>
      </div>
    </div>
  );
}
export default FEN;
