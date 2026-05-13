const PORT = 3000;
const { app } = require("./app");

//till socket
const { createServer } = require('http');
const { Server } = require('socket.io');

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
})

app.set('io', io);

io.on('connection', (socket) => {
  //skickar när en client connectar
  console.log("en användare har anslutit:", socket.id)

  // ----------------- ROOMS -----------------------------

  //when a user opens a board, join that rooms board
  socket.on('joinBoard', (board_id) => {
    socket.join(board_id);
    console.log(`${socket.id} has joined room ${board_id}`);
  })

  //when a user exits a board, leave that room
  socket.on('leaveBoard', (board_id) => {
    socket.leave(board_id);
    console.log(`${socket.id} has left room ${board_id}`)
  })

  //when a client disconnects
  socket.on('disconnect', () => {
    console.log("en användare har disconnectat:", socket.id);
  })
})

// This is the backend entry file.
// Start the Express app here, but keep routes and database logic in app.js.
// That makes the app easier to understand and easier to test later.

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
