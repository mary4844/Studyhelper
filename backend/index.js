const PORT = 3000;
const { app } = require("./app");

// This is the backend entry file.
// Start the Express app here, but keep routes and database logic in app.js.
// That makes the app easier to understand and easier to test later.

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
