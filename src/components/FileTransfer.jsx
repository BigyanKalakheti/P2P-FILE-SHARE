import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer"; // Import simple-peer
import { v4 as uuidv4 } from "uuid"; // Generate unique IDs

const FileTransfer = ({ socket }) => {
  const [peer, setPeer] = useState(null);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState(null);
  const [roomId, setRoomId] = useState(""); // Room ID for connection
  const [generatedLink, setGeneratedLink] = useState("");
  const peerRef = useRef(null); // Use ref to store the peer connection
  const [peerReady, setPeerReady] = useState(false); // Track if peer is ready

  // Set up peer connection and socket listeners
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const existingRoomId = params.get("roomId");
    let initiate= false;
    if (existingRoomId) {
      console.log(`Joining existing room: ${existingRoomId}`);
      setRoomId(existingRoomId);
      initiate=true
      console.log(roomId);
      socket.emit("joinRoom", { roomId: existingRoomId });
    }
    if (!existingRoomId) {
      console.log("Creating room...");
      const newRoomId = uuidv4(); // Generate unique ID
      setRoomId(newRoomId);
      initiate=false
      const link = `${window.location.origin}?roomId=${newRoomId}`;
      setGeneratedLink(link);
      console.log(`Generated room link: ${link}`);
      socket.emit("joinRoom", { roomId: newRoomId })
    }
    
    const newPeer = new Peer({
      initiator: initiate, // Set to true for the peer initiating the connection
      trickle: false, // Disable trickle ICE for simplicity
      stream: null, // Optional: If you want to stream media, you can add the stream here
    });


    // Handle signaling data (offer, answer, candidate)
    newPeer.on("signal", (data) => {
      if (data.candidate) {
        console.log("Sending ICE candidate:", data.candidate);
        socket.emit("candidate", { roomId, candidate: data.candidate });
      } else {
        console.log("Sending offer/answer:", data);
        socket.emit("offer", { roomId: existingRoomId, offer: data });
        peerRef.current = newPeer;
      }
    });

    // Handle data received from the peer (file transfer)
    newPeer.on("data", (data) => {
      console.log("Received file data:", data);
      const blob = new Blob([data]);
      setReceivedFile(blob);
    });

    // Listen for the data channel being opened
    newPeer.on("channelOpen", () => {
      console.log("Data channel is open");
      setPeerReady(true); // Mark the peer as ready
    });

    

    socket.on("offer", ({ offer, roomId }) => {
      console.log("Received offer for room:", roomId);
      console.log("offer: ",offer)
      setRoomId(roomId);
      console.log("Sent answer to the offer");
      const newPeer = new Peer({
        initiator: false,  // Peer 1 is not the initiator
        trickle: false,
        stream: null,  // You can stream media here if necessary
      });
      newPeer.on("signal", (data) => {
        if (data.sdp) {
          console.log("Sending answer:", data);
          socket.emit("answer", { roomId, answer: data }); // Send answer back to Peer 2
        }
      });
  
      // Set the remote description (Offer from Peer 2)
      newPeer.signal(offer);
    
      // Store the peer connection for later use (send file, etc.)
      peerRef.current = newPeer;
    });

    socket.on("answer", ({ answer }) => {
      console.log("Received answer:", answer);
      newPeer.signal(answer);
      peerRef.current = newPeer;
    });

    socket.on("candidate", ({ candidate }) => {
      console.log("Received ICE candidate:", candidate);
      newPeer.signal(candidate); // Add received candidate to the peer connection
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
    };
  }, []);



  
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

    if (!peer._channel) {
      console.error("Error: Data channel is not open peer._channel. : ", peer._channel);
      return;
    }

    if (peer._channel.readyState !== "open") {
      console.error("Error: Data channel is not open. : ",peer._channel.readyState);
      return;
    }


    console.log("Starting file transfer...");

    const reader = new FileReader();

    reader.onloadstart = () => {
      console.log("File transfer started");
    };

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = (event.loaded / event.total) * 100;
        setProgress(percent); // Update progress
        console.log(`File transfer progress: ${Math.round(percent)}%`);
      }
    };

    reader.onload = () => {
      console.log("File transfer completed.");
      peer._channel.send(reader.result);
      setProgress(100); // Set to 100% once file is sent
      console.log("File sent successfully.");
    };

    reader.onerror = (error) => {
      console.error("FileReader error:", error);
    };

    reader.readAsArrayBuffer(file); // Send file as ArrayBuffer
  };

  // Download received file
  const downloadFile = () => {
    if (!receivedFile) {
      console.error("No file received.");
      return;
    }

    console.log("Downloading received file...");
    const url = URL.createObjectURL(receivedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = "received_file"; // Modify the filename as necessary
    link.click();
    URL.revokeObjectURL(url);
    console.log("Download complete.");
  };

  return (
    <div>
      <h1>File Transfer</h1>
      {generatedLink && (
        <div>
          <p>Share this link with others to join the room:</p>
          <a href={generatedLink} target="_blank" rel="noopener noreferrer">{generatedLink}</a>
        </div>
      )}
      <div>
        <h2>Send File</h2>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button onClick={sendFile}>Send File</button>
        {progress > 0 && <p>Progress: {Math.round(progress)}%</p>}
      </div>
      <div>
        <h2>Receive File</h2>
        <button onClick={downloadFile}>Download Received File</button>
      </div>
    </div>
  );
};

export default FileTransfer;


