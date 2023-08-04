import { Server as HTTPServer } from "http";
import { Socket, Server } from "socket.io";
import { randomUUID } from "crypto";
import { IGameDTO, IGameSettings, WordGame } from "./wordgame";
import { ILobby } from "./frontend_types";

export interface IUser {
  sid: string;
  username: string;
  currentGame?: string;
}

export class ServerSocket {
  public static instance: ServerSocket;
  public io: Server;

  //Master list of all connected users
  public users: { [uid: string]: IUser };
  public allTimeUsers: number;
  public gameInstances: { [gid: string]: WordGame };

  constructor(server: HTTPServer) {
    ServerSocket.instance = this;
    this.users = {};
    this.allTimeUsers = 0;
    this.gameInstances = {};
    this.io = new Server(server, {
      serveClient: false,
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: false,
      cors: {
        origin: "*",
      },
    });

    this.io.on("connect", this.StartListeners);

    console.info("Socket IO started.");
  }

  StartListeners = (socket: Socket) => {
    //console.info("Message received from " + socket.id);

    socket.on(
      "handshake",
      (
        callback: (
          uid: string,
          username: string,
          users: { [uid: string]: string },
          lobbies: { [gid: string]: IGameDTO }
        ) => void
      ) => {
        console.info("Handshake received form " + socket.id);
        // console.log(this.users);

        //Check if this is a reconnection
        // const reconnected = Object.values(this.users).includes(socket.id);
        const reconnected = this.GetSocketIdsOfUsers().includes(socket.id);

        if (reconnected) {
          console.info("This user has reconnected");

          const uid = this.GetUidFromSocketId(socket.id);

          const username =
            this.GetUsernameFromUid(uid) ?? this.GenerateGenericUsername();

          // const users = this.GetUidsOfUsers(); //uids of users
          const users = this.GetUsersForFrontend(); //uids and username of users

          const lobbies = this.GetLobbiesForFrontend();

          if (uid) {
            console.info("Sending callback for reconnect...");
            callback(uid, username, users, lobbies);
            return;
          }
        }

        //Generate new user
        const uid = randomUUID();
        this.allTimeUsers++;
        const username = this.GenerateGenericUsername();

        this.users[uid] = { sid: socket.id, username: username };

        // const users = this.GetUidsOfUsers(); //uids of users
        const users = this.GetUsersForFrontend(); //uids of users

        const lobbies = this.GetLobbiesForFrontend();

        console.info("Sending callback for handshake...");
        callback(uid, username, users, lobbies);

        // const sendToUsers = Object.values(this.users); //socket ids of users
        const userSockets = this.GetSocketIdsOfUsers(); //socket ids of users

        //Send new user to all connected users
        this.SendMessage(
          "user_connected",
          userSockets.filter((sid) => sid !== socket.id),
          users
        );
      }
    );
    socket.on("disconnect", () => {
      console.info("Disconnect received from " + socket.id);
      const uid = this.GetUidFromSocketId(socket.id);
      const user = this.users[uid];

      //if player was in game remove from game
      this.LeaveGame(user?.currentGame, socket.id);

      delete this.users[uid];
    });

    //Create gameInstance on server
    socket.on("create_game", (gameSettings: IGameSettings) => {
      this.CreateGameInstance(socket.id, gameSettings);
    });

    //join a game instance
    socket.on(
      "join_game",
      ({ gid, password }: { gid: string; password?: string }) => {
        this.JoinGame(gid, socket.id, password);
      }
    );

    //Leave a game instance
    socket.on("leave_game", (gid: string) => {
      this.LeaveGame(gid, socket.id);
    });

    //Leave a game instance
    socket.on("start_game", (gid: string) => {
      this.StartGame(gid, socket.id);
    });

    socket.on("check_guess", (guess: string) => {
      const result = this.CheckGuess(guess, socket.id);
    });
    socket.on("change_username", (username: string) => {
      this.ChangeUsername(socket.id, username);
    });
  };
  GenerateGenericUsername = (): string =>
    "New User " + this.allTimeUsers.toString();

  GetUidFromSocketId = (sid: string) => {
    return Object.keys(this.users).find((uid) => this.users[uid].sid === sid);
  };

  GetUsernameFromUid = (uid: string) => {
    for (const user_uid in this.users) {
      // console.log(user_uid, uid, user_uid === uid);
      if (user_uid === uid) {
        // console.log(this.users[uid].username);
        return this.users[uid].username;
      }
    }
    return null;
  };

  GetUidsOfUsers = () => Object.keys(this.users);

  GetSocketIdsOfUsers = () => {
    return Object.values(this.users).map((user) => user.sid);
  };

  GetSocketIdsOfPlayersInGame = (gid: string) => {
    return this.gameInstances[gid].getPlayers().map((player) => player.sid);
  };

  GetUsersForFrontend = (): { [uid: string]: string } => {
    let usersForFrontend = {};

    for (const uid in this.users) {
      usersForFrontend[uid] = this.users[uid].username;
    }
    return usersForFrontend;
  };

  GetLobbiesForFrontend = (): { [gid: string]: IGameDTO } => {
    let lobbiesForFrontend = {};

    for (const gid in this.gameInstances) {
      const game: WordGame = this.gameInstances[gid];
      lobbiesForFrontend[gid] = this.gameInstances[gid].getGameDTO();
    }

    return lobbiesForFrontend;
  };

  DeleteLobby = (gid) => {
    delete this.gameInstances[gid];
  };

  CreateGameInstance = (sid: string, gameSettings: IGameSettings) => {
    const uid = this.GetUidFromSocketId(sid);
    const user = this.users[uid];

    if (!user) {
      console.info("user does not exist");
      return;
    }

    //check if user already in lobby
    if (user.currentGame) {
      console.info("user already in a game");
      return;
    }

    const gid = randomUUID();
    const newGame = new WordGame(gid, this.SendMessage, gameSettings);
    this.gameInstances[gid] = newGame;

    //if falsy name provided via gamesettings
    const username = this.GetUsernameFromUid(uid);
    if (!newGame.gameSettings.name) {
      newGame.gameSettings.name = `Game of ${username}`;
    }

    //if you create a game you also join it / handles update of lobbies for frontend
    this.JoinGame(gid, sid, gameSettings.password);
  };

  JoinGame = (gid: string, sid: string, password?: string) => {
    console.info(`${sid} wants to join ${gid}`);

    const uid = this.GetUidFromSocketId(sid);
    const user = this.users[uid];
    const game = this.gameInstances[gid];

    if (user?.currentGame) {
      console.info(`join failed ${sid} is already in a game`);
      return;
    }

    if (game) {
      let error: { message: string } = { message: "" };
      game.join(user, gid, error, password);

      if (user.currentGame) {
        let users = this.GetSocketIdsOfUsers();

        users.forEach((user) => {
          this.SendMessage("update_lobby", [user], {
            [gid]: game.getGameDTO(user),
          });
        });

        this.SendMessage("update_gid", [sid], gid);
      } else {
        console.log(`could not join: ${error.message}`);
      }
    } else {
      console.info(`game ${gid} does not exist`);
    }
  };

  LeaveGame = (gid: string, sid: string) => {
    const uid = this.GetUidFromSocketId(sid);
    const user = this.users[uid];

    if (gid) {
      const game = this.gameInstances[gid];

      if (game) {
        console.info(`${sid} leaving ${gid}...`);

        if (user.currentGame && user.currentGame === gid) {
          game.leave(user);

          if (!user.currentGame) {
            this.SendMessage("update_gid", [sid], "");
            if (game.isGameEmpty()) {
              this.DeleteLobby(gid);
              const users = this.GetSocketIdsOfUsers();
              this.SendMessage("remove_lobby", users, gid);
            } else {
              //update this lobby for every player
              this.UpdateFrontendLobby(gid);
            }
          } else {
            console.info("leave was unsuccessful");
          }
        } else {
          console.info(`user is not in (a/this) game`);
        }
      } else {
        console.info(`game ${gid} does not exist`);
      }
    } else {
      // console.info(`gid: ${gid} invalid`);
    }
  };

  UpdateFrontendLobby = (gid: string) => {
    const users = this.GetSocketIdsOfUsers();
    const game = this.gameInstances[gid];

    if (game) {
      users.forEach((user) => {
        if (user) {
          this.SendMessage("update_lobby", [user], {
            [gid]: game.getGameDTO(user),
          });
        }
      });
    }
  };

  StartGame = (gid: string, sid: string) => {
    const uid = this.GetUidFromSocketId(sid);
    const user = this.users[uid];

    if (user) {
      if (user.currentGame === gid) {
        const game = this.gameInstances[gid];
        const players = game.players.map((p) => p.sid);

        const gameUpdate = () => {
          this.UpdateFrontendLobby(gid);
          this.SendMessage("reset_round", players);
        };

        const started = game.start(sid);
        // if (started) {
        //   this.UpdateFrontendLobby(gid);
        // }
      } else {
        console.info(`${sid} not in a/this game`);
      }
    }
  };

  CheckGuess = (guess: string, sid: string) => {
    console.info(`${sid} send a guess: ${guess}`);
    if (guess.length !== 5) {
      console.info(`guess: ${guess} of ${sid} invalid length`);
      this.SendMessage("guess_result", [sid], { evaluation: "invalid" });
      return;
    }

    const uid = this.GetUidFromSocketId(sid);
    const user = this.users[uid];
    const gid = user.currentGame;
    const game = this.gameInstances[gid];

    if (game) {
      const player = game.getPlayer(sid);
      if (player.playerState !== "guessing" || player.guessesLeft <= 0) {
        this.SendMessage("no_guesses", [sid]);
        return;
      }

      const { evaluation, result } = game.checkGuess(sid, guess);

      if (evaluation !== "invalid") {
        this.UpdateFrontendLobby(gid);
        this.SendMessage("guess_result", [sid], { evaluation, guess, result });
        return;
      }

      this.SendMessage("guess_result", [sid], { evaluation });
    }
  };
  ChangeUsername = (sid: string, username: string) => {
    if (username.length >= 2 && username.length <= 16) {
      const uid = this.GetUidFromSocketId(sid);
      const user = this.users[uid];

      if (user) {
        user.username = username;
        const gid = user.currentGame;
        const game = this.gameInstances[gid];
        //Update Lobby
        if (game) {
          const success = game.changeUsername(sid, username);
          if (success) {
            this.UpdateFrontendLobby(gid);
          }
        }
        this.SendMessage("namechange_success", [sid]);
      } else {
        console.log("ChangeUsername: User does not exist");
      }
    } else {
      console.log(`ChangeUsername: Username "${username}" invalid`);
    }
  };

  /**
   * Send a message through the socket
   * @param eventName The name of the event, ex: handshake
   * @param users List of socket id's
   * @param payload any information needed by the user for the state updates
   */
  SendMessage = (eventName: string, users: string[], payload?: Object) => {
    if (users.length === 0) return;
    console.info(`Emmitting event: ${eventName} to ${users}`);
    users.forEach((sid) =>
      payload
        ? this.io.to(sid).emit(eventName, payload)
        : this.io.to(sid).emit(eventName)
    );
  };
}
