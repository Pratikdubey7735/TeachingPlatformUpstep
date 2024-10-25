import React, { useState, useEffect } from "react";
import FEN from "./FEN";
import NOTFEN from "./NOTFEN";

const Upload = () => {
  const [pgnFiles, setPgnFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [level, setLevel] = useState("");
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Fetch PGN files based on selected level
    if (level) {
      console.log(`Fetching PGN files from: /api/pgn-files?level=${level}`); // Debugging log
      fetch(`/api/pgn-files?level=${level}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPgnFiles(data); // Store the PGNs related to the selected level
          } else {
            console.error("Expected an array from the response:", data);
            setPgnFiles([]); // Ensure it's an array
          }
        })
        .catch((error) => {
          console.error("Error fetching PGN files:", error);
          setPgnFiles([]); // Ensure it's an array on error
        });
    }
  }, [level]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isFullscreen && event.key === "Escape") {
        exitFullscreen();
      } else if (isFullscreen) {
        if (event.key === "ArrowDown") handleNext();
        else if (event.key === "ArrowUp") handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  const handleFileSelect = (event) => {
    const selectedUrl = event.target.value;
    setSelectedFile(selectedUrl);

    fetch(selectedUrl)
      .then((response) => response.text())
      .then((content) => parsePGN(content))
      .catch((error) => console.error("Error loading PGN file:", error));
  };

  const parsePGN = (content) => {
    const regex = /(?<!\[.*)\*\s*/g;
    const eventList = content
      .split(regex)
      .filter((event) => event.trim())
      .map((event) => event.trim() + " *");

    setEvents(eventList);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < events.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const currentEvent = events[currentIndex] || null;
  const isFEN = currentEvent ? currentEvent.includes("FEN") : false;

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const handleLevelSelect = (event) => {
    const selectedLevel = event.target.value;
    setLevel(selectedLevel);
    setSelectedFile("");
    setEvents([]);
    setCurrentIndex(0);
    setPgnFiles([]); // Clear existing PGN files
  };

  return (
    <div className={`min-h-screen bg-gray-400 p-4 ${isFullscreen ? "fullscreen" : ""}`}>
      {isFullscreen ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full h-full flex items-center justify-center">
            {currentEvent && (isFEN ? <FEN event={currentEvent} /> : <NOTFEN event={currentEvent} />)}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full">
            <h2 className="text-2xl font-semibold mb-4">Select Level</h2>
            <select
              onChange={handleLevelSelect}
              value={level}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            >
              <option value="">-- Select Level --</option>
              <option value="BeginnerClassworkPGN">Beginner Classwork</option>
              <option value="BeginnerHomeworkPGN">Beginner Homework</option>
              <option value="AdvBegClass">Advanced Beginner Classwork</option>
              <option value="AdvBegHome">Advanced Beginner Homework</option>
              <option value="InterClass">Intermediate Classwork</option>
              <option value="InterHome">Intermediate Homework</option>
              <option value="AdvanPart1Class">Advance Part-1 Classwork</option>
              <option value="AdvanPart1Home">Advance Part-1 Homework</option>
              <option value="AdvancePart2Class">Advance Part-2 Classwork</option>
              <option value="AdvPArt2Home">Advance Part-2 Homework</option>
            </select>
            <h2 className="text-2xl font-semibold mb-4">Select Chapter</h2>
            <select
              onChange={handleFileSelect}
              value={selectedFile}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              disabled={!pgnFiles.length} // Disable if no PGN files are available
            >
              <option value="">-- Select a PGN File --</option>
              {pgnFiles.map((file) => (
                <option key={file.filename} value={file.url}>
                  {file.filename}
                </option>
              ))}
            </select>

            <div className="mb-6 w-full">
              {currentEvent && (isFEN ? <FEN event={currentEvent} /> : <NOTFEN event={currentEvent} />)}
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-md bg-green-500 text-white"
        >
          Enter Fullscreen
        </button>
      )}
    </div>
  );
};

export default Upload;
