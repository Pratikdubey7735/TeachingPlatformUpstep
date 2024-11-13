import React, { useState, useMemo } from "react";
import { ChessboardDnDProvider, SparePiece } from "react-chessboard";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useNavigate } from "react-router-dom";

const DemoComponent = () => {
  const game = useMemo(() => new Chess("8/8/8/8/8/8/8/8 w - - 0 1"), []);
  const [boardOrientation, setBoardOrientation] = useState("white");
  const [fenPosition, setFenPosition] = useState(game.fen());
  const navigate = useNavigate();

  // Castling rights state
  const [castlingRights, setCastlingRights] = useState({
    whiteKingside: false,
    whiteQueenside: false,
    blackKingside: false,
    blackQueenside: false,
  });

  // Update FEN with castling rights based on selected checkboxes
  const handleGoButtonClick = () => {
    let updatedFen = fenPosition;

    // Determine castling rights
    let castlingString = "";
    if (castlingRights.whiteKingside) castlingString += "K";
    if (castlingRights.whiteQueenside) castlingString += "Q";
    if (castlingRights.blackKingside) castlingString += "k";
    if (castlingRights.blackQueenside) castlingString += "q";
    if (castlingString === "") castlingString = "-";

    // Update FEN to include castling rights
    const fenParts = updatedFen.split(" ");
    fenParts[2] = castlingString;
    updatedFen = fenParts.join(" ");

    console.log("Current FEN Position with Castling Rights:", updatedFen);
    navigate("/play", { state: { fen: updatedFen } });
  };

  // Handle dropping a piece from the spare container onto the board
  const handleSparePieceDrop = (piece, targetSquare) => {
    const color = piece[0];
    const type = piece[1].toLowerCase();
    const success = game.put({ type, color }, targetSquare);
    if (success) {
      setFenPosition(game.fen());
    } else {
      alert(`The board already contains a ${color === "w" ? "WHITE" : "BLACK"} KING`);
    }
    return success;
  };

  // Handle moving a piece within the board
  const handlePieceDrop = (sourceSquare, targetSquare) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q", // Always promote to a queen for simplicity
    });
    if (move) {
      setFenPosition(game.fen());
      return true;
    }
    return false;
  };

  // Handle removing a piece when dragged off the board
  const handlePieceDropOffBoard = (sourceSquare) => {
    game.remove(sourceSquare);
    setFenPosition(game.fen());
  };

  // Input handler for manually setting the FEN position
  const handleFenInputChange = (e) => {
    const fen = e.target.value;
    const { valid } = game.validate_fen(fen);
    if (valid) {
      game.load(fen);
      setFenPosition(game.fen());
    }
  };

  const pieces = [
    "wP",
    "wN",
    "wB",
    "wR",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bB",
    "bR",
    "bQ",
    "bK",
  ];

  const boardWrapperStyle = {
    margin: "0 auto",
    maxWidth: "650px",
    position: "relative",
    display: "flex",
    justifyContent: "center",
  };

  const buttonStyle = {
    margin: "10px",
    padding: "5px 10px",
    cursor: "pointer",
  };

  const inputStyle = { margin: "10px", padding: "5px", width: "100%" };

  return (
    <div className="bg-slate-500 mt-[-9px]">
      <ChessboardDnDProvider>
        <div style={boardWrapperStyle}>
          {/* Spare pieces for black */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "10px",
            }}
            className="bg-slate-600 rounded-xl"
          >
            {pieces.slice(6, 12).map((piece) => (
              <SparePiece key={piece} piece={piece} width={45} dndId="ManualBoardEditor" />
            ))}
          </div>
          {/* Chessboard with border */}
          <div
            style={{
              border: "8px solid #FF8C00",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "8px",
            }}
          >
            <Chessboard
              id="ManualBoardEditor"
              position={fenPosition}
              boardOrientation={boardOrientation}
              boardWidth={650}
              onSparePieceDrop={handleSparePieceDrop}
              onPieceDrop={handlePieceDrop}
              onPieceDropOffBoard={handlePieceDropOffBoard}
              dropOffBoardAction="trash"
              customBoardStyle={{
                borderRadius: "0px",
                backgroundColor: "#ffffff",
              }}
              customNotationStyle={{
                fontSize: "20px",
              }}
            />
          </div>

          {/* Spare pieces for white */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "10px",
            }}
            className="bg-slate-600 rounded-xl"
          >
            {pieces.slice(0, 6).map((piece) => (
              <SparePiece key={piece} piece={piece} width={45} dndId="ManualBoardEditor" />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="bg-blue-500 rounded-2xl text-white"
            style={buttonStyle}
            onClick={() => {
              game.reset();
              setFenPosition(game.fen());
            }}
          >
            Start position ♟️
          </button>
          <button
            className="bg-blue-500 rounded-2xl text-white"
            style={buttonStyle}
            onClick={() => {
              game.clear();
              setFenPosition(game.fen());
            }}
          >
            Clear board 🗑️
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
          <button
            className="bg-green-500 rounded-2xl text-white"
            style={buttonStyle}
            onClick={handleGoButtonClick}
          >
            Go ➡️
          </button>
        </div>
        
        {/* Castling checkboxes */}
        <div className="text-2xl " style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.whiteKingside}
              onChange={() =>
                setCastlingRights((prev) => ({ ...prev, whiteKingside: !prev.whiteKingside }))
              }
            />
            White 0-0
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.whiteQueenside}
              onChange={() =>
                setCastlingRights((prev) => ({ ...prev, whiteQueenside: !prev.whiteQueenside }))
              }
            />
            White 0-0-0
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.blackKingside}
              onChange={() =>
                setCastlingRights((prev) => ({ ...prev, blackKingside: !prev.blackKingside }))
              }
            />
            Black 0-0
          </label>
          <label>
            <input
              type="checkbox"
              checked={castlingRights.blackQueenside}
              onChange={() =>
                setCastlingRights((prev) => ({ ...prev, blackQueenside: !prev.blackQueenside }))
              }
            />
            Black 0-0-0
          </label>
        </div>

        {/* FEN input */}
        <input
          value={fenPosition}
          style={inputStyle}
          onChange={handleFenInputChange}
          placeholder="Paste FEN position to start editing"
        />
      </ChessboardDnDProvider>
    </div>
  );
};
export default DemoComponent;
