import React, { useRef, useEffect, useState } from "react";
import { Route } from "react-router-dom";

function Board({ socket, roomId, connectionId }) {
  const objc = {
    id: 123,
    name: "anas",
  };
  const [grid, setGrid] = useState([
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]); //Array(9).fill(null))

  const [player, setPlayer] = useState("X");
  // players in the room

  const [currentPlayers, setCurrentPlayers] = useState([]);

  // this to not play twice
  const [isPlayed, setPlayed] = useState(false);

  // when the game finished
  const [gameFinished, setGameFinished] = useState(false);

  // the winner
  const [winner, setWinner] = useState("");

  let children = 0;

  function checkWinner(grid) {
    // check rows
    for (let row = 0; row < 3; row++) {
      if (
        grid[row][0] != null &&
        grid[row][0] == grid[row][1] &&
        grid[row][1] == grid[row][2]
      ) {
        return grid[row][0];
      }
    }

    // check columns
    for (let col = 0; col < 3; col++) {
      if (
        grid[0][col] != null &&
        grid[0][col] == grid[1][col] &&
        grid[1][col] == grid[2][col]
      ) {
        return grid[0][col];
      }
    }

    // check diagonals
    if (
      grid[0][0] != null &&
      grid[0][0] == grid[1][1] &&
      grid[1][1] == grid[2][2]
    ) {
      return grid[0][0];
    }

    if (
      grid[0][2] != null &&
      grid[0][2] == grid[1][1] &&
      grid[1][1] == grid[2][0]
    ) {
      return grid[0][2];
    }

    return "none";
  }

  const handleResetClick = async () => {
    const object = {
      roomId: roomId,
    };

    await socket.emit("clear_board", object);
  };

  const handleClick = async (row, col) => {
    if (!isPlayed) {
      const newGrid = [...grid];

      setGrid(newGrid);
      newGrid[row][col] = player;

      const moveData = {
        player: player,
        boardState: grid,
        roomId: roomId,
      };

      await socket.emit("new_move", moveData);
      setPlayed(true);
    }
  };

  useEffect(() => {
    // Send disconnect message before the page is unloaded

    socket.on("disconnect", () => {
      console.log("Disconnected from the server");
      // Send data to the server when the client disconnects
    });

    // get current players in the room
    socket.on("current_players", (players) => {
      setCurrentPlayers(players);
      console.log("Am called again players now is" + players);
    });

    // get the states of the board and check for the winner
    socket.on("new_board", (object) => {
      // checking with conntionId this will help player to not play twice
      if (object.connectionId === connectionId) {
        setPlayed(true);
      } else {
        setPlayed(false);
      }
      setGrid(object.data);

      let winner = checkWinner(object.data);
      if (winner !== "none") {
        setGameFinished(true);
        setWinner(winner);
      }
      if (object.player === "X") {
        setPlayer("O");
      } else {
        setPlayer("X");
      }
    });

    // clear board
    socket.on("board_cleared", () => {
      setGrid([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      setGameFinished(false);
    });
  }, [socket]);

  return (
    <div>
      {" "}
      <div className="flex  justify-centerw-1/3 ">
        {grid.map((row, rowIndex) => (
          <div className="flex flex-col items-center" key={rowIndex}>
            {row.map((cell, colIndex) => (
              <button
                className="border border-black w-16 h-16 flex items-center justify-center"
                onClick={() => handleClick(rowIndex, colIndex)}
                key={colIndex}
              >
                {cell || " "}
              </button>
            ))}
          </div>
        ))}
        <div>
          <h1 className="text-xl ml-5">Current Players:</h1>
          {currentPlayers.map((item) => (
            <h4 className="ml-5" key={children++}>
              {item}
            </h4>
          ))}
        </div>
      </div>
      {gameFinished && (
        <div className="text-center">
          <h3>Winner is {winner}</h3>
          <button
            onClick={handleResetClick}
            className="bg-green-500 p-3 rounded mt-4"
          >
            Play Again{" "}
          </button>
        </div>
      )}
    </div>
  );
}

export default Board;
