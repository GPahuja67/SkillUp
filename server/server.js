// server/server.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");

// DB + routes
const connectDB = require("./config/db");
const routes = require("./routes/routes");

// socket
const socketSetup = require("./socket");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

/* ---------------- CONNECT MONGO ---------------- */
connectDB();

/* ---------------- MIDDLEWARE ---------------- */
app.use(cors()); // tighten origin in production
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));

/* ---------------- STATIC ---------------- */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "../client")));

/* ---------------- API ROUTES ---------------- */
app.use("/api", routes);

/* ---------------- SOCKET.IO ---------------- */
socketSetup(server);

/* ---------------- FRONTEND FALLBACK ---------------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

/* ---------------- START SERVER ---------------- */
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
