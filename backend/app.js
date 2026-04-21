// Import express so we can create the main backend application.
const express = require("express");
// Import cors so the frontend can talk to the backend from the browser.
const cors = require("cors");
// Import path so we can point Express to the frontend folder safely.
const path = require("path");

const tasksRouter = require("./routes/tasks");
const boardsRouter = require("./routes/boards");

const app = express();

// Allow cross-origin requests during development.
app.use(cors());
// Let Express understand JSON bodies sent from the frontend.
app.use(express.json());  
// Serve the frontend files as static files.
app.use(express.static(path.join(__dirname, "../frontend")));

// Redirect the root URL to the start page in the frontend.
app.get("/", (req, res) => {
  res.redirect("startpage.html");
});

// Mount all task-related routes onto the app.
app.use('/tasks', tasksRouter);
// Mount all board-related routes onto the app.
app.use('/boards', boardsRouter);

// Export the app so route tests can import it later.
module.exports = { app };
