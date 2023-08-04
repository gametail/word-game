import express from "express";
import http from "http";
import { ServerSocket } from "./socket";

const app = express();

//Server Handling
const httpServer = http.createServer(app);

//Start the Socket
new ServerSocket(httpServer);

//Log the request
app.use((req, res, next) => {
  console.info(
    `METHOD: [${req.method}] - URL: [${req.url}] IP: [${req.socket.remoteAddress}]`
  );

  res.on("finish", () => {
    console.info(
      `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
    );
  });

  next();
});

//Parse the body of the request
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//API rules
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

//Healthcheck

app.get("/ping", (req, res, next) => {
  return res.status(200).json({ hello: "world!" });
});

//get Time
app.get("/time", (req, res, next) => {
  return res.status(200).json({ time: new Date().getTime() });
});

//Socket information
app.get("/status", (req, res, next) => {
  const games = Object.entries(ServerSocket.instance.gameInstances).reduce(
    (acc, curr) => {
      return (acc[curr[0]] = {
        gid: curr[1].gid,
        players: curr[1].players,
        leaderIndex: curr[1].leaderIndex,
        gameState: curr[1].gameState,
        gameSettings: curr[1].gameSettings,
        // timeout: curr[1].timeout ? curr[1].timeout : "none",
        currentRound: curr[1].currentRound,
        roundStart: curr[1].roundStart
          ? new Date(curr[1].roundStart).toISOString()
          : "none",
        words: curr[1].words,
      });
    },

    {}
  );

  return res.status(200).json({
    users: ServerSocket.instance.users,
    gameInstances: games,
  });
});

app.get("/shazam", (req, res, next) => {
  const gameWords = Object.entries(ServerSocket.instance.gameInstances).reduce(
    (acc, curr) => (acc[curr[0]] = { words: curr[1].words }),
    {}
  );

  return res.status(200).json({
    gameWords,
  });
});

app.use((req, res, next) => {
  const error = new Error("Not found");

  res.status(400).json({ message: error.message });
});

//Listen

const port = 3001;
httpServer.listen(port, () => console.info("Server is running on port", port));
