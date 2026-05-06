require('dotenv').config(); //new
const { auth, requiresAuth } = require('express-openid-connect'); //new
// const { auth } = require('express-openid-connect');

const express = require("express"); // framework used to simplify crating the server


const cors = require("cors");
const { Pool } = require("pg");
const path = require("path"); // tool for handling file paths safely

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

const PORT = 3000;

const pool = new Pool({ 
  user: "postgres",
  host: "localhost",
  database: "study_tracker",
  password: "1337",
  port: 5432,
});

// Auth0 configuration
const config = {
  authRequired: false,      // Allow public routes
  auth0Logout: true,        // Use Auth0 logout endpoint
  secret: process.env.SECRET,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
};

// Apply the auth middleware
app.use(auth(config));


// Home route - shows login/logout status
app.get('/', (req, res) => {
  const isAuthenticated = req.oidc.isAuthenticated();

  res.send(`
    <html>
      <head>
        <title>Auth0 Express Quickstart</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
          a { color: #0066cc; text-decoration: none; margin-right: 1rem; }
          a:hover { text-decoration: underline; }
          .status { padding: 1rem; border-radius: 4px; margin: 1rem 0; }
          .logged-in { background: #d4edda; color: #155724; }
          .logged-out { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <h1>Auth0 Express Quickstart</h1>
        <div class="status ${isAuthenticated ? 'logged-in' : 'logged-out'}">
          ${isAuthenticated ? '✓ You are logged in' : '✗ You are logged out'}
        </div>
        <nav>
          ${isAuthenticated
            ? '<a href="/profile">Profile</a> | <a href="/logout">Logout</a>'
            : '<a href="/login">Login</a>'}
        </nav>
      </body>
    </html>
  `);
});

// Protected profile route - requires authentication
app.get('/profile', requiresAuth(), (req, res) => {
  const user = req.oidc.user;

  res.send(`
    <html>
      <head>
        <title>Profile - Auth0 Express</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
          a { color: #0066cc; text-decoration: none; }
          img { border-radius: 50%; }
          pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
          .card { border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
        </style>
      </head>
      <body>
        <h1>User Profile</h1>
        <div class="card">
          ${user.picture ? `<img src="${user.picture}" alt="Profile" width="80" />` : ''}
          <h2>${user.name || user.nickname || 'User'}</h2>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        </div>
        <h3>Full User Object</h3>
        <pre>${JSON.stringify(user, null, 2)}</pre>
        <nav>
          <a href="/">← Back to Home</a> | <a href="/logout">Logout</a>
        </nav>
      </body>
    </html>
  `);
});

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// app.get("/", (req, res) => {
//   res.redirect("startpage.html");
// });

// app.get("/tasks", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM tasks ORDER BY task_id");
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     res.status(500).json({ error: "Failed to fetch tasks" });
//   }
// });

// app.post("/add_task", async (req, res) => {
//   console.log("entered add task");

//   try {
//     const { name } = req.body

//     console.log('New message:', name);

//     const result = await pool.query(
//       "INSERT INTO tasks (task_name) VALUES ($1) RETURNING *",
//       [name]
//     );

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error creating task:", error);
//     res.status(500).json({ error: "Failed to create task" });
//   }
// });

// app.post("/create_board", async (req, res) => {
//   try {
//     const { name } = req.body

//     // console.log('New message:', name)

//     const result = await pool.query(
//       "INSERT INTO board (title) VALUES ($1) RETURNING *",
//       [name]
//     );

//     res.json(result.rows[0]);
//   } catch (error) {
//     console.error("Error creating board:", error);
//     res.status(500).json({ error: "Failed to create board" });
//   }
// });

// app.post("/clearList", async (req, res) => { // clears items in table tasks
//   try {
//     const result = await pool.query("delete from tasks");
//     res.json(result.rows);
//   } catch (error){
//     console.error("Error Failed to clear list:", error);
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
