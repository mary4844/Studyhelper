//app.js är en samling av olika routes som deligerar olika request i frontend 
// till olika route filer i backend/routes där funktionerna körs.



const express = require("express");   //ramverket vi använder för att skapa vår backend server.
const cors = require("cors");         //middelware som möjligör kommunikation mellan frontend och backend 
const path = require("path");       // modul för att hantera filvägar på datorns filsysten oavsett OS

// exempel tasksRouter blir variabeln som pekar på den routern vi skapar i routes/tasks.js
const tasksRouter = require("./routes/tasks");
const boardsRouter = require("./routes/boards");

const app = express();

// Möjligör kommunikationen mellan back och frontend
app.use(cors());
// JSON bodies kommande från frontend körs om till JS-objekt så express kan läsa dem
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

//Auth0

require('dotenv').config(); //new
const { auth, requiresAuth } = require('express-openid-connect'); //new
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

// omderigiera root url till startpage.html
app.get("/", (req, res) => {
  const isAuthenticated = req.oidc.isAuthenticated();
  isAuthenticated ? res.redirect("startpage.html") : res.redirect("login.html");
  // res.redirect("startpage.html");
});

// Föravidare all /task routes requests på vår app from frontend ex. GET /tasks/add till task.js
app.use('/tasks', tasksRouter);
app.use('/boards', boardsRouter);
//TODO: fortsätt skriva routs för resterande funkinoaliteter?





// Export the app so route tests can import it later.
module.exports = { app };
