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

  //temp
  socket.user = {
    id: socket.id
  }
  //man måste ange vilka rum från frontend, dvs en GET och sedan lista på boards
  socket.on('join room', async boardId => {
    const userId = socket.user.id;

    //dont need for testing sockets, restricted by db
      //const hasAccess = await canUserAccessBoard(userId, boardId);
      //if (!hasAccess) return;

    socket.join(String(boardId));
    console.log("joined:", socket.id, boardId);
  });
  //frontenden kan se ut
  //const boards = await fetch('/api/boards').then(r => r.json());
  //boards.forEach(board => {
  //socket.emit('join room', board.id);
  //});

})

// This is the backend entry file.
// Start the Express app here, but keep routes and database logic in app.js.
// That makes the app easier to understand and easier to test later.

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
