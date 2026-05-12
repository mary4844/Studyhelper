const PORT = 3000;
const app  = require("./app");
const { Server } = require("socket.io");
const http = require("http");
const { canUserAccessBoard } = require('./utils.js');

const server = http.createServer(app);

// Attach Socket.IO to the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
  },
});

app.set('io', io);

io.on("connection", socket => {
  //skriver ut vilken socket som connectat
  console.log("New client connected to server", socket.id);

  //rooms

  //man måste ange vilka rum från frontend, dvs en GET och sedan lista på boards
  socket.on('join room', async boardId => {

    socket.join(String(boardId));
    console.log("joined:", socket.id, boardId);
  });

})

// This is the backend entry file.
// Start the Express app here, but keep routes and database logic in app.js.
// That makes the app easier to understand and easier to test later.

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
