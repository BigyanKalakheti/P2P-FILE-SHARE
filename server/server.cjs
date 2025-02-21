// const { Server } = require("socket.io");
// const http = require("http");

// const server = http.createServer();
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Allow requests from your frontend
//     methods: ["GET", "POST"]
//   }
// });

// let usersInRoom = {}; // Keep track of users in a room

// io.on("connection", (socket) => {
//   const userId = socket.id;
//   console.log("New WebSocket Connection", userId);

//   socket.on("joinRoom", ({ roomId }) => {
//     if (!usersInRoom[roomId]) {
//       usersInRoom[roomId] = new Set();
//     }

//     // Check if user has already joined the room
//     if (usersInRoom[roomId].has(userId)) {
//       console.log(`User with ID ${userId} has already joined room: ${roomId}`);
//       return;
//     }

//     usersInRoom[roomId].add(userId);
//     socket.join(roomId);
//     console.log(`User with ID ${userId} joined room: ${roomId}`);

//     // Notify other users in the room
//     socket.to(roomId).emit("userJoined", { userId });

//     // Notify the current user that they joined the room
//     socket.emit("roomJoined", { roomId });

//     // If there are already users in the room, trigger the offer creation
//     if (usersInRoom[roomId].size > 1) {
//       const otherUserId = Array.from(usersInRoom[roomId]).find(id => id !== userId);
//       socket.to(otherUserId).emit("requestOffer", { roomId, userId });
//     }
//   });

//   socket.on("offer", ({ roomId, offer }) => {
//     console.log(`Received offer for room: ${roomId}`);
//     socket.to(roomId).emit("offer", { offer, roomId });
//   });

//   socket.on("answer", ({ roomId, answer }) => {
//     console.log(`Received answer for room: ${roomId}`);
//     socket.to(roomId).emit("answer", { answer });
//   });

//   socket.on("candidate", ({ roomId, candidate }) => {
//     console.log(`Received ICE candidate for room: ${roomId}`);
//     socket.to(roomId).emit("candidate", { candidate });
//   });

//   socket.on("disconnect", () => {
//     // Remove user from any room they're in
//     for (let roomId in usersInRoom) {
//       if (usersInRoom[roomId].has(userId)) {
//         usersInRoom[roomId].delete(userId);
//         console.log(`User with ID ${userId} left room: ${roomId}`);
//         socket.to(roomId).emit("userLeft", { userId });
//       }
//     }
//   });
// });

// server.listen(5000, () => {
//   console.log("Signaling server running on port 3000");
// });


const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: ["GET", "POST"],
  },
});

let usersInRoom = {}; // Keep track of users in a room

io.on("connection", (socket) => {
  const userId = socket.id;
  console.log("New WebSocket Connection:", userId);

  // Handle joining a room
  socket.on("joinRoom", ({ roomId }) => {
    if (!roomId) {
      console.error("Room ID is required.");
      return;
    }

    if (!usersInRoom[roomId]) {
      usersInRoom[roomId] = new Set();
    }

    // Check if user has already joined the room
    if (usersInRoom[roomId].has(userId)) {
      console.log(`User with ID ${userId} has already joined room: ${roomId}`);
      return;
    }

    // Add user to the room
    usersInRoom[roomId].add(userId);
    socket.join(roomId);
    console.log(`User with ID ${userId} joined room: ${roomId}`);

    // Notify other users in the room
    socket.to(roomId).emit("userJoined", { userId });

    // Notify the current user that they joined the room
    socket.emit("roomJoined", { roomId });

    // If there are already users in the room, trigger the offer creation
    if (usersInRoom[roomId].size > 1) {
      const otherUserId = Array.from(usersInRoom[roomId]).find((id) => id !== userId);
      socket.to(otherUserId).emit("requestOffer", { roomId, userId });
    }
  });

  // Handle offer from a client
  socket.on("offer", ({ roomId, offer }) => {
    if (!roomId || !offer) {
      console.error("Room ID and offer are required.");
      return;
    }

    console.log(`Received offer for room: ${roomId}`);
    socket.to(roomId).emit("offer", { offer, roomId });
  });

  // Handle answer from a client
  socket.on("answer", ({ roomId, answer }) => {
    if (!roomId || !answer) {
      console.error("Room ID and answer are required.");
      return;
    }

    console.log(`Received answer for room: ${roomId}`);
    socket.to(roomId).emit("answer", { answer });
  });

  // Handle ICE candidate from a client
  socket.on("candidate", ({ roomId, candidate }) => {
    if (!roomId || !candidate) {
      console.error("Room ID and candidate are required.");
      return;
    }

    console.log(`Received ICE candidate for room: ${roomId}`);
    socket.to(roomId).emit("candidate", { candidate });
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User with ID ${userId} disconnected.`);

    // Remove user from any room they're in
    for (let roomId in usersInRoom) {
      if (usersInRoom[roomId].has(userId)) {
        usersInRoom[roomId].delete(userId);
        console.log(`User with ID ${userId} left room: ${roomId}`);

        // Notify other users in the room
        socket.to(roomId).emit("userLeft", { userId });

        // Clean up empty rooms
        if (usersInRoom[roomId].size === 0) {
          delete usersInRoom[roomId];
          console.log(`Room ${roomId} is empty and has been deleted.`);
        }
      }
    }
  });
});

server.listen(5000, () => {
  console.log("Signaling server running on port 5000");
});