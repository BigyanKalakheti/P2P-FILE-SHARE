import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import FileTransfer from "./components/FileTransfer";

const socket = io("ws://localhost:5000");

const App = () => {
  return (
    <div>
      <h1>P2P File Sharing</h1>
      <FileTransfer socket={socket} />
    </div>
  );
};

export default App;
