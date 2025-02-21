// import React, { useState, useEffect } from "react";
// import PeerConnection from "./PeerConnection";
// import { v4 as uuidv4 } from "uuid"; // Generate unique IDs

// const FileTransfer = ({ socket }) => {
//   const [peer, setPeer] = useState(null);
//   const [file, setFile] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [receivedFile, setReceivedFile] = useState(null);
//   const [roomId, setRoomId] = useState(""); // Room ID for connection
//   const [generatedLink, setGeneratedLink] = useState("");

//   useEffect(() => {
//     console.log("Setting up peer connection...");
//     const newPeer = new PeerConnection(
//       (candidate) => socket.emit("candidate", { roomId, candidate }),
//       (channel) => {
//         console.log("Data channel created from remote peer.");
//         // Handle incoming messages on the data channel
//         channel.onmessage = (event) => {
//           console.log("Received file data:", event.data);
//           const blob = new Blob([event.data]);
//           setReceivedFile(blob);
//         };
//       }
//     );

    

//     // Listen for offer from another peer
//     socket.on("offer", async ({ offer, roomId }) => {
//       console.log("Received offer for room:", roomId);
//       setRoomId(roomId);
//       const answer = await newPeer.handleOffer(offer);
//       socket.emit("answer", { roomId, answer });
//     });

//     // Listen for answer from another peer
//     socket.on("answer", async ({ answer }) => {
//       console.log("Received answer:", answer);
//       await newPeer.handleAnswer(answer);
//     });

//     // Listen for ICE candidates
//     socket.on("candidate", ({ candidate }) => {
//       console.log("Received ICE candidate:", candidate);
//       newPeer.handleCandidate(candidate);
//     });

//     setPeer(newPeer);

//   }, [socket]);

//   // Create a room and generate a shareable link
//   const createRoom = async () => {
//     console.log("Creating room...");
//     const newRoomId = uuidv4(); // Generate unique ID
//     setRoomId(newRoomId);
//     setGeneratedLink(`${window.location.origin}?roomId=${newRoomId}`);

//     console.log(`Generated room link: ${generatedLink}`);

//     try {
//       const offer = await peer.createOffer();
//       console.log(`Sending offer to signaling server: ${newRoomId}`);
//       socket.emit("offer", { roomId: newRoomId, offer });
//     } catch (error) {
//       console.error("Error creating offer:", error);
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
//   }, []);

//   useEffect(() => {
//     socket.on("requestOffer", async ({ roomId, userId }) => {
//       console.log("Received request to create offer for room:", roomId);
//       const offer = await peer.createOffer();
//       socket.emit("offer", { roomId, offer });
//     });
  
//     return () => {
//       socket.off("requestOffer");
//     };
//   }, [socket, roomId]);

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

//     if (peer.channel.readyState !== "open") {
//       console.error(`Error: Data channel is not open. Current state: ${peer.channel.readyState}`);
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
//       peer.channel.send(reader.result);
//       setProgress(100); // Set to 100% once file is sent
//     };

//     reader.onerror = (error) => {
//       console.error("FileReader error:", error);
//     };

//     reader.readAsArrayBuffer(file); // Send file as ArrayBuffer
//   };

//   // Download received file
//   const downloadReceivedFile = () => {
//     if (!receivedFile) return;
//     const url = URL.createObjectURL(receivedFile);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "received_file";
//     document.body.appendChild(a);
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div>
//       <h2>P2P File Sharing</h2>

//       {!roomId ? (
//         <button onClick={createRoom}>Create Room & Generate Link</button>
//       ) : (
//         <p>Share this link: <a href={generatedLink}>{generatedLink}</a></p>
//       )}

//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={sendFile} disabled={!peer}>Send File</button>
//       <progress value={progress} max="100"></progress>

//       {receivedFile && (
//         <div>
//           <p>File received! Click below to download:</p>
//           <button onClick={downloadReceivedFile}>Download File</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FileTransfer;

import React, { useState, useEffect, useRef } from "react";
import PeerConnection from "./PeerConnection";
import { v4 as uuidv4 } from "uuid"; // Generate unique IDs

const FileTransfer = ({ socket }) => {
  const [peer, setPeer] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [roomId, setRoomId] = useState(""); // Room ID for connection
  const [generatedLink, setGeneratedLink] = useState("");
  const peerRef = useRef(null); // Use ref to store the peer connection

  // Set up peer connection and socket listeners
  useEffect(() => {
    console.log("Setting up peer connection...");

    const newPeer = new PeerConnection(
      (candidate) => {
        console.log("Sending ICE candidate:", candidate);
        socket.emit("candidate", { roomId, candidate });
      },
      (channel) => {
        console.log("Data channel created from remote peer.");
        // Handle incoming messages on the data channel
        channel.onmessage = (event) => {
          console.log("Received file data:", event.data);
          const blob = new Blob([event.data]);
          setReceivedFile(blob);
        };
      }
    );

    peerRef.current = newPeer; // Store peer connection in ref
    setPeer(newPeer);

    // Listen for offer from another peer
    socket.on("offer", async ({ offer, roomId }) => {
      console.log("Received offer for room:", roomId);
      setRoomId(roomId);
      const answer = await newPeer.handleOffer(offer);
      socket.emit("answer", { roomId, answer });
    });

    // Listen for answer from another peer
    socket.on("answer", async ({ answer }) => {
      console.log("Received answer:", answer);
      await newPeer.handleAnswer(answer);
    });

    // Listen for ICE candidates
    socket.on("candidate", ({ candidate }) => {
      console.log("Received ICE candidate:", candidate);
      newPeer.handleCandidate(candidate);
    });

    // Cleanup on unmount
    // return () => {
    //   console.log("Cleaning up peer connection...");
    //   socket.off("offer");
    //   socket.off("answer");
    //   socket.off("candidate");
    //   if (newPeer) {
    //     newPeer.close();
    //   }
    // };
  }, [socket]);

  // Create a room and generate a shareable link
  const createRoom = async () => {
    console.log("Creating room...");
    const newRoomId = uuidv4(); // Generate unique ID
    setRoomId(newRoomId);
    const link = `${window.location.origin}?roomId=${newRoomId}`;
    setGeneratedLink(link);

    console.log(`Generated room link: ${link}`);

    try {
      const offer = await peer.createOffer();
      console.log(`Sending offer to signaling server: ${newRoomId}`);
      socket.emit("offer", { roomId: newRoomId, offer });
    } catch (error) {
      console.error("Error creating offer:", error);
    }
  };

  // Join a room if a roomId is in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const existingRoomId = params.get("roomId");

    if (existingRoomId) {
      console.log(`Joining existing room: ${existingRoomId}`);
      setRoomId(existingRoomId);
      socket.emit("joinRoom", { roomId: existingRoomId });
    }
  }, [socket]);

  // Handle request to create an offer
  useEffect(() => {
    socket.on("requestOffer", async ({ roomId, userId }) => {
      console.log("Received request to create offer for room:", roomId);
      try {
        const offer = await peer.createOffer();
        socket.emit("offer", { roomId, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    return () => {
      socket.off("requestOffer");
    };
  }, [socket, peer]);

  // Send the file over WebRTC
  const sendFile = () => {
    if (!file) {
      console.error("Error: No file selected.");
      return;
    }

    if (!peer) {
      console.error("Error: Peer connection not established.");
      return;
    }

    if (peer.channel.readyState !== "open") {
      console.error(`Error: Data channel is not open. Current state: ${peer.channel.readyState}`);
      return;
    }

    const reader = new FileReader();

    reader.onloadstart = () => {
      console.log("File transfer started");
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent); // Update progress
      }
    };

    reader.onload = () => {
      console.log("File transfer completed.");
      peer.channel.send(reader.result);
      setProgress(100); // Set to 100% once file is sent
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };

    reader.readAsArrayBuffer(file); // Send file as ArrayBuffer
  };

  // Download received file
  const downloadReceivedFile = () => {
    if (!receivedFile) return;
    const url = URL.createObjectURL(receivedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = "received_file";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>P2P File Sharing</h2>

      {!roomId ? (
        <button onClick={createRoom}>Create Room & Generate Link</button>
      ) : (
        <p>Share this link: <a href={generatedLink}>{generatedLink}</a></p>
      )}

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={sendFile} disabled={!peer}>Send File</button>
      <progress value={progress} max="100"></progress>

      {receivedFile && (
        <div>
          <p>File received! Click below to download:</p>
          <button onClick={downloadReceivedFile}>Download File</button>
        </div>
      )}
    </div>
  );
};

export default FileTransfer;