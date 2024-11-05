import React, { useState, useEffect, useCallback } from "react";
import FEN from "./FEN";
import NOTFEN from "./NOTFEN";

const Upload = () => {
  const [pgnFiles, setPgnFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [level, setLevel] = useState("");
  const [events, setEvents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [expandedLevel, setExpandedLevel] = useState(null);

  useEffect(() => {
    if (level) {
      console.log(`Fetching PGN files from: https://backendteachingplatform.onrender.com/api/pgn-files?level=${level}`);
      fetch(`https://backendteachingplatform.onrender.com/api/pgn-files?level=${level}`)
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPgnFiles(data);
          } else {
            console.error("Expected an array from the response:", data);
            setPgnFiles([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching PGN files:", error);
          setPgnFiles([]);
        });
    }
  }, [level]);

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

  const handleLevelSelect = (selectedLevel, label) => {
    setLevel(selectedLevel);
    setSelectedLabel(label);
    setSelectedFile("");
    setEvents([]);
    setCurrentIndex(0);
    setPgnFiles([]);
    setExpandedLevel(null); // Close dropdown on selection
  };

  const levels = {
    Beginner: [
      { value: "BeginnerClassworkPGN", label: "Classwork" },
      { value: "BeginnerHomeworkPGN", label: "Homework" }
    ],
    AdvancedBeginner: [
      { value: "AdvBegClass", label: "Classwork" },
      { value: "AdvBegHome", label: "Homework" }
    ],
    Intermediate: [
      { value: "InterClass", label: "Classwork" },
      { value: "InterHome", label: "Homework" }
    ],
    AdvancedPart1: [
      { value: "AdvanPart1Class", label: "Classwork" },
      { value: "AdvanPart1Home", label: "Homework" }
    ],
    AdvancedPart2: [
      { value: "AdvancePart2Class", label: "Classwork" },
      { value: "AdvPArt2Home", label: "Homework" }
    ],
    Junior: [
      { value: "Jr1C", label: "Jr1" },
      { value: "Jr2C", label: "Jr2" }
    ]
  };

  // Handle keydown for navigation and fullscreen toggle
  const handleKeyDown = useCallback((event) => {
    if (isFullscreen) {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault(); // Prevent scrolling
        if (event.key === "ArrowUp") {
          setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (event.key === "ArrowDown") {
          setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, events.length - 1));
        }
      } else if (event.key === "Escape") {
        setIsFullscreen(false);
        document.exitFullscreen().catch((err) => console.error(err));
      }
    }
  }, [isFullscreen, events.length]);
  
  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen, handleKeyDown]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  return (
    <div className={`min-h-screen bg-gray-200 p-6 ${isFullscreen ? "fullscreen" : ""}`}>
      {isFullscreen ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full h-full flex items-center justify-center">
            {events[currentIndex] && (events[currentIndex].includes("FEN") ? <FEN event={events[currentIndex]} /> : <NOTFEN event={events[currentIndex]} />)}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Select Level</h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {Object.keys(levels).map((levelName) => (
                <div key={levelName} className="relative">
                  <button
                    className={`w-40 p-3 bg-gray-800 text-white rounded-md shadow-md transition-transform duration-200 ease-in-out hover:bg-green-600 focus:outline-none focus:ring focus:ring-pink-300 ${selectedLabel.includes(levelName) ? "bg-green-500" : ""}`}
                    onClick={() => setExpandedLevel(expandedLevel === levelName ? null : levelName)}
                  >
                    {levelName}
                  </button>
                  {expandedLevel === levelName && (
                    <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1 w-full">
                      {levels[levelName].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => handleLevelSelect(value, `${levelName} - ${label}`)}
                          className="block w-full text-left p-2 hover:bg-gray-400 focus:outline-none"
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Select Chapter</h2>
            <select
              onChange={handleFileSelect}
              value={selectedFile}
              className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring focus:ring-blue-300"
              disabled={!pgnFiles.length}
            >
              <option value="">-- Select a PGN File --</option>
              {pgnFiles.map((file) => (
                <option key={file.filename} value={file.url}>
                  {file.filename}
                </option>
              ))}
            </select>

            <div className="mb-6 w-full">
              {events[currentIndex] && (events[currentIndex].includes("FEN") ? <FEN event={events[currentIndex]} /> : <NOTFEN event={events[currentIndex]} />)}
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="mt-4 p-3 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
        >
          Enter Fullscreen
        </button>
      )}
    </div>
  );
};

export default Upload;
