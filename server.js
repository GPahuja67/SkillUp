const express = require("express");
const http = require("http");
const socketSetup = require("./socket");

const app = express();
const server = http.createServer(app);

app.use(express.static("client")); // VERY IMPORTANT

socketSetup(server);

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
