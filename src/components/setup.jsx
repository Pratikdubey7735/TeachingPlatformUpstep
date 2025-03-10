import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  const [category, setCategory] = useState("Foundation"); // New state for category selection

  const navigate = useNavigate();

  useEffect(() => {
    if (level) {
      console.log(`Fetching PGN files from:https://backendteachingplatform.onrender.com/api/pgn-files?level=${level}`);
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

  const goToDemo = () => {
    navigate("/demo"); // Navigate to DEMO component
  };

  const handleFileSelect = (event) => {
    const selectedUrl = event.target.value;
    setSelectedFile(selectedUrl);

    fetch(selectedUrl)
      .then((response) => response.text())
      .then((content) => parsePGN(content))
      .catch((error) => console.error("Error loading PGN file:", error));
  };

  const parsePGN = (content) => {
    const regex = /(?=\[Event\s)/g; // Matches the start of each PGN game by detecting '[Event '.
  
    const eventList = content
      .split(regex) // Splits the content whenever '[Event ' is detected.
      .filter((event) => event.trim()) // Removes empty or whitespace-only entries.
      .map((event) => event.trim()); // Trims each event string.
  
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
    BeginnerClasswork: [{ value: "BeginnerClassworkPGN", label: "Classwork" }],
    BeginnerHomework: [{ value: "BeginnerHomeworkPGN", label: "Homework" }],
    AdvancedBeginnerClasswork: [{ value: "AdvBegClass", label: "Classwork" }],
    AdvancedBeginnerHomework: [{ value: "AdvBegHome", label: "Homework" }],
    IntermediateClasswork: [{ value: "InterClass", label: "Classwork" }],
    IntermediateHomework: [{ value: "InterHome", label: "Homework" }],
    AdvancedPart1Classwork: [{ value: "AdvanPart1Class", label: "Classwork" }],
    AdvancedPart1Homework: [{ value: "AdvanPart1Home", label: "Homework" }],
    AdvancedPart2Classwork: [
      { value: "AdvancePart2Class", label: "Classwork" },
    ],
    AdvancedPart2Homework: [{ value: "AdvPart2Home", label: "Homework" }],
    Junior_Classwork: [
      { value: "Jr1C", label: "Jr1" },
      { value: "Jr2C", label: "Jr2" },
      { value: "Jr3C", label: "Jr3" },
      { value: "Jr4C", label: "Jr4" },
      { value: "Jr5C", label: "Jr5" },
      { value: "Jr6C", label: "Jr6" },
    ],
    Junior_Homework: [
      { value: "Jr1H", label: "Jr1" },
      { value: "Jr2H", label: "Jr2" },
      { value: "Jr3H", label: "Jr3" },
      { value: "Jr4H", label: "Jr4" },
      { value: "Jr5H", label: "Jr5" },
      { value: "Jr6H", label: "Jr6" },
    ],
    Sub_Junior_Classwork: [
      { value: "SubJr1C", label: "SJr1" },
      { value: "SubJr2C", label: "SJr2" },
      { value: "SubJr3C", label: "SJr3" },
      { value: "SubJr4C", label: "SJr4" },
      { value: "SubJr5C", label: "SJr5" },
      { value: "SubJr6C", label: "SJr6" },
    ],
    Sub_Junior_Homework: [
      { value: "SubJr1H", label: "SJr1" },
      { value: "SubJr2H", label: "SJr2" },
      { value: "SubJr3H", label: "SJr3" },
      { value: "SubJr4H", label: "SJr4" },
      { value: "SubJr5H", label: "SJr5" },
      { value: "SubJr6H", label: "SJr6" },
    ],
    Senior_Part1_Classwork: [
      { value: "Sr1C", label: "Sr1" },
      { value: "Sr2C", label: "Sr2" },
      { value: "Sr3C", label: "Sr3" },
      { value: "Sr4C", label: "Sr4" },
      { value: "Sr5C", label: "Sr5" },
      { value: "Sr6C", label: "Sr6" },
    ],
    Senior_Part1_Homework: [
      { value: "Sr1H", label: "Sr1" },
      { value: "Sr2H", label: "Sr2" },
      { value: "Sr3H", label: "Sr3" },
      { value: "Sr4H", label: "Sr4" },
      { value: "Sr5H", label: "Sr5" },
      { value: "Sr6H", label: "Sr6" },
    ],
    Senior_Part2_Classwork: [
      { value: "Sr7C", label: "Sr7" },
      { value: "Sr8C", label: "Sr8" },
      { value: "Sr9C", label: "Sr9" },
      { value: "Sr10C", label: "Sr10" },
      { value: "Sr11C", label: "Sr11" },
      { value: "Sr12C", label: "Sr11" },
    ],
    Senior_Part2_Homework: [
      { value: "Sr7H", label: "Sr7" },
      { value: "Sr8H", label: "Sr8" },
      { value: "Sr9H", label: "Sr9" },
      { value: "Sr10H", label: "Sr10" },
      { value: "Sr11H", label: "Sr11" },
      { value: "Sr12H", label: "Sr11" },
    ],
  };

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, events.length - 1));
  };

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault(); // Prevent scrolling
        if (event.key === "ArrowUp") {
          setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        } else if (event.key === "ArrowDown") {
          setCurrentIndex((prevIndex) =>
            Math.min(prevIndex + 1, events.length - 1)
          );
        }
      } else if (event.key === "Escape") {
        setIsFullscreen(false);
        document.exitFullscreen().catch((err) => console.error(err));
      }
    },
    [events.length]
  );

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
      document.documentElement
        .requestFullscreen()
        .catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  // Filter levels based on the category selected (Foundation, Masters, or Senior)
  const filteredLevels =
    category === "Beginner"
      ? ["BeginnerClasswork", "BeginnerHomework"]
      : category === "AdvancedBeginner"
      ? ["AdvancedBeginnerClasswork", "AdvancedBeginnerHomework"]
      : category === "Intermediate"
      ? ["IntermediateClasswork", "IntermediateHomework"]
      : category === "AdvancedPart1"
      ? ["AdvancedPart1Classwork", "AdvancedPart1Homework"]
      : category === "AdvancedPart2"
      ? ["AdvancedPart2Classwork", "AdvancedPart2Homework"]
      : category === "Junior"
      ? ["Junior_Classwork", "Junior_Homework"] // Only Junior levels for Masters
      : category === "SubJunior"
      ? ["Sub_Junior_Classwork", "Sub_Junior_Homework"]
      : category === "SeniorPart2"
      ? ["Senior_Part2_Classwork", "Senior_Part2_Homework"]
      : ["Senior_Part1_Classwork", "Senior_Part1_Homework"]; // Senior levels for Senior category

  return (
    <div
      className={`min-h-screen bg-gray-200 p-6 ${
        isFullscreen ? "fullscreen" : ""
      }`}
    >
      {isFullscreen ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full h-full flex items-center justify-center">
            {events[currentIndex] &&
              (events[currentIndex].includes("FEN") ? (
                <FEN event={events[currentIndex]} />
              ) : (
                <NOTFEN event={events[currentIndex]} />
              ))}
          </div>
        </div>
      ) : (
        <div className="w-full">
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6 w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Select Category
            </h2>
            <div className="flex gap-4 mb-4">
              {[
                "Beginner",
                "AdvancedBeginner",
                "Intermediate",
                "AdvancedPart1",
                "AdvancedPart2",
                "SubJunior",
                "Junior",
                "SeniorPart1",
                "SeniorPart2",
              ].map((cat) => (
                <a
                  href={`/category/${cat}`} // Link for right-click functionality
                  target="_blank"
                  rel="noopener noreferrer"
                  key={cat}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent default for left click
                    setCategory(cat); // Call your left-click function
                  }}
                  onContextMenu={(e) => {
                    // Allows right-click to work as a link (open in new tab)
                    e.stopPropagation(); // Prevent interference with other right-click actions
                  }}
                  className={`w-40 p-3 bg-gray-800 text-white rounded-md shadow-md transition-transform duration-200 ease-in-out hover:bg-green-600 focus:outline-none focus:ring focus:ring-pink-300 ${
                    category === cat ? "bg-green-500" : ""
                  }`}
                >
                  {cat.replace(/([A-Z])/g, " $1")} {/* Format category name */}
                </a>
              ))}
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Select Level
            </h2>
            <div className="flex flex-wrap gap-4 mb-4">
              {filteredLevels.map((levelName) => {
                const levelOptions = levels[levelName] || []; // Default to an empty array if undefined
                return (
                  <div key={levelName} className="relative">
                    <a
                      href="#"
                      className={`w-45 p-3 bg-gray-800 text-white rounded-md shadow-md transition-transform duration-200 ease-in-out hover:bg-green-600 focus:outline-none focus:ring focus:ring-pink-300 ${
                        selectedLabel.includes(levelName) ? "bg-green-500" : ""
                      }`}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent default link behavior for left click
                        setExpandedLevel(
                          expandedLevel === levelName ? null : levelName
                        );
                      }}
                      onContextMenu={(e) => {
                        // Allows right-click to work as a link (open in new tab)
                        e.stopPropagation(); // Prevents other right-click actions if any
                      }}
                    >
                      {levelName}
                    </a>
                    {expandedLevel === levelName && (
                      <div className="absolute bg-white border border-gray-300 rounded-md shadow-lg z-10 mt-1 w-full">
                        {levelOptions.map(({ value, label }) => (
                          <a
                            href={`/level/${value}`} // Link for right-click functionality
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.preventDefault(); // Prevent default for left-click
                              handleLevelSelect(
                                value,
                                `${levelName} - ${label}`
                              );
                            }}
                            className="block w-full text-left p-2 hover:bg-gray-400 focus:outline-none"
                            key={value}
                          >
                            {label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Select Chapter
            </h2>
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
              {events[currentIndex] &&
                (events[currentIndex].includes("FEN") ? (
                  <FEN event={events[currentIndex]} />
                ) : (
                  <NOTFEN event={events[currentIndex]} />
                ))}
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && (
        <>
          <button
            onClick={toggleFullscreen}
            className="mt-4 p-3 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring focus:ring-green-300"
          >
            Enter Fullscreen
          </button>
        </>
      )}

      <button
        onClick={goToDemo}
        className="mt-4 ml-4 p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
      >
        DEMO
      </button>
      <div className="flex flex-row gap-4 fixed bottom-16 right-20">
            <button
              onClick={handlePrevious}
              className="p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Next
            </button>
          </div>
    </div>
  );
};
export default Upload;
