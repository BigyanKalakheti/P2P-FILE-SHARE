// import React, { useState, useEffect, useRef } from "react";
// import Peer from "simple-peer"; // Import simple-peer
// import { v4 as uuidv4 } from "uuid"; // Generate unique IDs

// const FileTransfer = ({ socket }) => {
//   const [peer, setPeer] = useState(null);
//   const [file, setFile] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [receivedFile, setReceivedFile] = useState(null);
//   const [roomId, setRoomId] = useState(""); // Room ID for connection
//   const [generatedLink, setGeneratedLink] = useState("");
//   const peerRef = useRef(null); // Use ref to store the peer connection
//   const [peerReady, setPeerReady] = useState(false); // Track if peer is ready

//   // Set up peer connection and socket listeners
//   useEffect(() => {
//     console.log("Setting up peer connection...");

//     const newPeer = new Peer({
//       initiator: false, // Set to true for the peer initiating the connection
//       trickle: false, // Disable trickle ICE for simplicity
//       stream: null, // Optional: If you want to stream media, you can add the stream here
//     });

//     // Handle signaling data (offer, answer, candidate)
//     newPeer.on("signal", (data) => {
//       if (data.candidate) {
//         console.log("Sending ICE candidate:", data.candidate);
//         socket.emit("candidate", { roomId, candidate: data.candidate });
//       } else {
//         console.log("Sending offer/answer:", data);
//         socket.emit("offer", { roomId, offer: data });
//       }
//     });

//     // Handle data received from the peer (file transfer)
//     newPeer.on("data", (data) => {
//       console.log("Received file data:", data);
//       const blob = new Blob([data]);
//       setReceivedFile(blob);
//     });

//     // Listen for the data channel being opened
//     newPeer.on("channelOpen", () => {
//       console.log("Data channel is open");
//       setPeerReady(true); // Mark the peer as ready
//     });

//     peerRef.current = newPeer;
//     setPeer(newPeer);

//     socket.on("offer", ({ offer, roomId }) => {
//       console.log("Received offer for room:", roomId);
//       setRoomId(roomId);
//       newPeer.signal(offer); // Respond with the received offer
//     });

//     socket.on("answer", async ({ answer }) => {
//       console.log("Received answer:", answer);
//       newPeer.signal(answer); // Respond with the received answer
//     });

//     socket.on("candidate", ({ candidate }) => {
//       console.log("Received ICE candidate:", candidate);
//       newPeer.signal(candidate); // Add received candidate to the peer connection
//     });

//     return () => {
//       socket.off("offer");
//       socket.off("answer");
//       socket.off("candidate");
//     };
//   }, [socket]);

//   // Create a room and generate a shareable link
//   const createRoom = async () => {
//     console.log("Creating room...");
//     const newRoomId = uuidv4(); // Generate unique ID
//     setRoomId(newRoomId);
//     const link = `${window.location.origin}?roomId=${newRoomId}`;
//     setGeneratedLink(link);

//     console.log(`Generated room link: ${link}`);

//     socket.emit("joinRoom", { roomId: newRoomId });  // Emit to server

//     // Ensure peer connection is ready
//     if (peerReady && peerRef.current && peerRef.current._channel && peerRef.current._channel.readyState === "open") {
//       try {
//         // Only create the offer if peer connection is properly set up
//         const offer = peerRef.current.signal();
//         socket.emit("offer", { roomId: newRoomId, offer });
//       } catch (error) {
//         console.error("Error creating offer:", error);
//       }
//     } else {
//       console.error("Peer connection is not ready. Make sure it is initialized properly.");
//     }
//   };

//   // Join a room if a roomId is in the URL
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const existingRoomId = params.get("roomId");

//     if (existingRoomId) {
//       console.log(`Joining existing room: ${existingRoomId}`);
//       setRoomId(existingRoomId);
//       socket.emit("joinRoom", { roomId: existingRoomId });
//     }
//   }, [socket]);

//   // Send the file over WebRTC
//   const sendFile = () => {
//     if (!file) {
//       console.error("Error: No file selected.");
//       return;
//     }

//     if (!peer) {
//       console.error("Error: Peer connection not established.");
//       return;
//     }

//     if (!peer._channel || peer._channel.readyState !== "open") {
//       console.error("Error: Data channel is not open.");
//       return;
//     }

//     const reader = new FileReader();

//     reader.onloadstart = () => {
//       console.log("File transfer started");
//     };

//     reader.onprogress = (event) => {
//       if (event.lengthComputable) {
//         const percent = (event.loaded / event.total) * 100;
//         setProgress(percent); // Update progress
//       }
//     };

//     reader.onload = () => {
//       console.log("File transfer completed.");
//       peer._channel.send(reader.result);
//       setProgress(100); // Set to 100% once file is sent
//     };

//     reader.onerror = (error) => {
//       console.error("FileReader error:", error);
//     };

//     reader.readAsArrayBuffer(file); // Send file as ArrayBuffer
//   };

//   // Download received file
//   const downloadFile = () => {
//     if (!receivedFile) {
//       console.error("No file received.");
//       return;
//     }

//     const url = URL.createObjectURL(receivedFile);
//     const link = document.createElement("a");
//     link.href = url;
//     link.download = "received_file"; // Modify the filename as necessary
//     link.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div>
//       <h1>File Transfer</h1>
//       {generatedLink && (
//         <div>
//           <p>Share this link with others to join the room:</p>
//           <a href={generatedLink} target="_blank" rel="noopener noreferrer">{generatedLink}</a>
//         </div>
//       )}
//       <button onClick={createRoom}>Create Room</button>
//       <div>
//         <h2>Send File</h2>
//         <input
//           type="file"
//           onChange={(e) => setFile(e.target.files[0])}
//         />
//         <button onClick={sendFile}>Send File</button>
//         {progress > 0 && <p>Progress: {Math.round(progress)}%</p>}
//       </div>
//       <div>
//         <h2>Receive File</h2>
//         <button onClick={downloadFile}>Download Received File</button>
//       </div>
//     </div>
//   );
// };

// export default FileTransfer;

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';

const socket = io('http://localhost:5000'); // Signaling server

const FileTransfer = () => {
  const [roomId, setRoomId] = useState('');
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [peerReady, setPeerReady] = useState(false);
  const peerRef = useRef(null);

  // Set up the peer connection for the first user
  useEffect(() => {
    if (roomId) {
      // First user creates the room
      console.log("Creating room...");
      socket.emit("createRoom", roomId);

      socket.on("roomCreated", (room) => {
        console.log("Room created:", room);
        setUsersInRoom(room.users);
      });

      // Listen for offer from other user
      socket.on("offer", (data) => {
        if (peerRef.current) {
          peerRef.current.signal(data.offer);
        }
      });

      // Listen for answer from other user
      socket.on("answer", (data) => {
        if (peerRef.current) {
          peerRef.current.signal(data.answer);
        }
      });

      // Listen for ICE candidates from the other peer
      socket.on("candidate", (data) => {
        if (peerRef.current) {
          peerRef.current.signal(data.candidate);
        }
      });
    }
  }, [roomId]);

  // Set up the peer connection when the second user joins the room
  useEffect(() => {
    if (usersInRoom.length > 1 && !peerRef.current) {
      console.log("Setting up peer connection for second user...");
      const newPeer = new Peer({ initiator: false, trickle: false, stream: null });

      newPeer.on('signal', (data) => {
        if (data.sdp) {
          console.log("Sending offer signal:", data);
          socket.emit("offer", { roomId, offer: data });
        }
        if (data.candidate) {
          socket.emit("candidate", { roomId, candidate: data });
        }
      });

      peerRef.current = newPeer;
      setPeerReady(true);
    }
  }, [usersInRoom, roomId]);

  // Set up the peer connection for the first user
  useEffect(() => {
    if (usersInRoom.length === 1 && !peerRef.current) {
      console.log("Setting up peer connection for first user...");
      const newPeer = new Peer({ initiator: true, trickle: false, stream: null });

      newPeer.on('signal', (data) => {
        if (data.sdp) {
          console.log("Sending offer signal:", data);
          socket.emit("offer", { roomId, offer: data });
        }
        if (data.candidate) {
          socket.emit("candidate", { roomId, candidate: data });
        }
      });

      peerRef.current = newPeer;
      setPeerReady(true);
    }
  }, [usersInRoom, roomId]);

  // Handle offer creation when both peers are ready
  useEffect(() => {
    if (peerReady && peerRef.current && peerRef.current._channel && peerRef.current._channel.readyState === "open") {
      console.log("Creating offer...");

      try {
        // Create the offer
        const offer = peerRef.current.signal(); // Assuming `peerRef.current` has the signal method.
        socket.emit("offer", { roomId, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    } else {
      console.log("Waiting for other users to join...");
    }
  }, [peerReady, roomId]);

  const createRoom = () => {
    const newRoomId = Math.floor(Math.random() * 1000000000).toString();
    setRoomId(newRoomId);
    console.log(`Room created: ${newRoomId}`);
  };

  return (
    <div>
      <button onClick={createRoom}>Create Room</button>
      <p>Room ID: {roomId}</p>
      <p>Users in Room: {usersInRoom.join(", ")}</p>
    </div>
  );
};

export default FileTransfer;
