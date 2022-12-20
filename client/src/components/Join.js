import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";

function Join({ socket, setRoomId, roomId }) {
  const [username, setUsername] = useState("");
  const history = useHistory();
  const [error,setError]=useState("")

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (roomId !== "" && username !== "") {
      const data = {
        player_name: username,
        room_id: roomId,
      };
      await socket.emit("join_game", data);
    }

    // Send the username and room ID to the server or do something else with them
  };

  useEffect(() => {
    socket.on("room_available", () => {
      history.push("/play");
      setError("")
    });
    socket.on("room_full",()=>{
      setError("This room is full , join another room ")

    })
  }, [socket]);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm">
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label
            className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor="username"
          >
            Username
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="username"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>
      </div>
      <div className="md:flex md:items-center mb-6">
        <div className="md:w-1/3">
          <label
            className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4"
            htmlFor="room-id"
          >
            Room ID
          </label>
        </div>
        <div className="md:w-2/3">
          <input
            className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
            id="room-id"
            type="text"
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
          />
        </div>
      </div>
      <div className="md:flex md:items-center">
        <div className="md:w-1/3"></div>
        <div className="md:w-2/3">
          <div className="text-center">
            <button
              className="shadow bg-purple-500 hover:bg-purple-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded"
              type="submit"
            >
              Join
            </button>
          </div>
          <div className="font-bold text-red-400">
          {error}

          </div>

        </div>
      </div>
    </form>
  );
}

export default Join;
