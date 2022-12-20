import logo from "./logo.svg";
import "./App.css";
import Board from "./components/Board";
import Join from "./components/Join";
import io from "socket.io-client";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import React, { useState } from "react";

const server ="http://localhost:3001"
const socket = io.connect(server);




function App() {
  const [connectionId,setConnectionId]=useState("")

  socket.on('connect', () => {
    console.log(socket.id); // an alphanumeric id...
    setConnectionId(socket.id)
  });
  console.log("Connectios id is "+connectionId);
  
const [roomId, setRoomId] = useState("");

  return (
    <div className="flex flex-col items-center  mt-5 ">
      <Router>
        <h1 className="text-2xl font-bold p-4">Tic Tac toe Online </h1>
        <Switch>
          <Route exact path="/">
            <Join socket={socket} setRoomId={setRoomId} roomId={roomId} />
          </Route>
          <Route path="/play">
            <Board socket={socket} roomId={roomId} connectionId={connectionId} />
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
