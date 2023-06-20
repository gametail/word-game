import { ILobby } from "./frontend_types";
import { IUser } from "./socket";
import { IsInList, getRandomWord } from "./words";

export type PlayerState = "guessing" | "waiting";
export interface IPlayer extends IUser {
  guessesLeft: number;
  playerState: PlayerState;
  score: number;
  guessHistory: IHistoryObject[];
}

type TPayloadMap = { [sid: string]: Object };
type TPayload = Object | TPayloadMap;

type TFeedback = "match" | "misplace" | "mismatch";
interface IHistoryObject {
  result: TFeedback[];
  word?: string;
}

const MAX_PLAYERS = 20;
const MIN_PLAYERS = 1;
const DEFAULT_GAMESETTINGS: IGameSettings = {
  name: "no-name",
  maxPlayers: 4,
  guesses: 5,
  rounds: 1,
  time: 90,
};

export type GameState = "initializing" | "lobby" | "ingame";

export interface IGameSettings {
  name: string;
  password?: string;
  maxPlayers: number;
  guesses: number;
  rounds: number;
  time: number;
}
export interface IGameDTO {
  gameState: GameState;
  gameSettings: IGameSettings;
  leaderIndex: number;
  selfIndex: number;
  players: IPlayerDTO[];
  currentRound: number;
  roundStart: number | undefined;
}
export interface IPlayerDTO {
  username: string;
  score: number;
  guesses: number;
  state: PlayerState;
  guessHistory: IHistoryObject[];
}

export class WordGame {
  gid: string;
  players: IPlayer[];
  leaderIndex: number;
  gameState: GameState = "initializing";
  gameSettings: IGameSettings = DEFAULT_GAMESETTINGS;
  timeout: NodeJS.Timeout | undefined;
  currentRound: number;
  roundStart: number | undefined;
  words: string[];
  SendMessageFn: (eventName: string, users: string[], payload?: Object) => void;

  constructor(
    gid: string,
    SendMessageFn: (
      eventName: string,
      users: string[],
      payload?: Object
    ) => void,
    gameSettings?: IGameSettings
  ) {
    this.gid = gid;
    this.players = [];
    this.gameState = "lobby";
    this.leaderIndex = 0;
    this.currentRound = 1;
    this.roundStart = undefined;
    this.words = [];
    this.timeout = undefined;
    this.SendMessageFn = SendMessageFn;

    if (gameSettings) this.gameSettings = gameSettings;
  }

  SendMessageToPlayers(
    eventName: string,
    players?: IPlayer[],
    payload?: TPayload
  ) {
    let sids: string[];
    if (players) {
      sids = players.map(({ sid }) => sid);
    } else {
      sids = this.players.map(({ sid }) => sid);
    }

    sids.forEach((sid) => {
      if (payload) {
        this.SendMessageFn(eventName, [sid], payload[sid] || payload);
      } else {
        this.SendMessageFn(eventName, [sid]);
      }
    });
  }

  start(sid: string): boolean {
    if (this.gameState === "initializing") {
      console.info("cant start, game is still initializing");
      return false;
    }
    if (this.gameState === "ingame") {
      console.info("cant start, game already running");
      return false;
    }

    const playerIndex = this.getPlayerIndex(sid);
    if (playerIndex === this.leaderIndex) {
      this.gameState = "ingame";

      this.resetGame();
      this.startRound();

      return true;
    } else {
      console.info(`cant start game ${sid} is not leader`);
      return false;
    }
  }

  startRound() {
    this.players.forEach((player) => {
      player.guessesLeft = this.gameSettings.guesses;
      player.playerState = "guessing";
      player.guessHistory = [];
    });

    this.words.push(getRandomWord());

    this.roundStart = new Date().getTime();

    const gameSeconds =
      this.gameSettings.time === 0 ? 600000 : this.gameSettings.time;

    this.timeout = setTimeout(() => {
      if (this.players.length === 0) return;

      if (this.currentRound < this.gameSettings.rounds) {
        this.currentRound++;
        this.startRound();
      } else {
        this.gameState = "lobby";

        const test = this.players.reduce((acc, { sid }) => {
          acc[sid] = { [this.gid]: this.getGameDTO(sid) };
          return acc;
        }, {} as TPayloadMap);

        console.log(test);

        // this.SendMessage();
        this.SendMessageToPlayers("update_lobby", this.players, test);
        this.SendMessageToPlayers("reset_round", this.players);

        console.info("game finished");
      }
    }, gameSeconds * 1000);

    // this.SendMessage();
    const test = this.players.reduce((acc, { sid }) => {
      acc[sid] = { [this.gid]: this.getGameDTO(sid) };
      return acc;
    }, {} as TPayloadMap);

    console.log(test);

    this.SendMessageToPlayers("update_lobby", this.players, test);
    this.SendMessageToPlayers("reset_round", this.players);
  }
  resetGame() {
    this.currentRound = 1;
    this.roundStart = undefined;
    this.words = [];
  }

  join(
    user: IUser,
    gid: string,
    // callback: (success: boolean, message?: string) => void,
    error: string,
    password?: string
  ): void {
    //check if game is initializing
    if (this.gameState === "initializing") {
      error = "game is still initializing";
      return;
    }

    if (this.isGameFull()) {
      error = "game is full.";
      return;
    }
    if (this.isGameRunning()) {
      error = "game is already running.";
      return;
    }

    if (this.gameSettings.password && this.gameSettings.password !== password) {
      error = "wrong password.";
      return;
    }
    //check if player already joined
    if (this.getPlayer(user.sid)) {
      error = "is already joined.";
      return;
    }

    this.players.push({
      ...user,
      score: 0,
      guessesLeft: this.gameSettings.guesses,
      playerState: "waiting",
      guessHistory: [],
    });
    user.currentGame = gid;
  }

  leave(user: IUser): void {
    const { sid } = user;

    //check if game is initializing
    if (this.gameState === "initializing") {
      console.info(`Game is still initializing`);
      return;
    }
    //filter player if he is in this game
    if (this.getPlayer(sid)) {
      this.players = this.players.filter((player) => player.sid !== sid);
      console.info(`${sid} left the game.`);
      user.currentGame = undefined;
    } else {
      console.info(`${sid} player was not in this game.`);
    }
  }

  getPlayers(): IPlayer[] {
    return this.players;
  }
  getCurrentWord(): string {
    return this.words[this.currentRound - 1];
  }
  isGameFull(): boolean {
    return this.players.length >= this.gameSettings.maxPlayers;
  }
  isGameEmpty(): boolean {
    return this.players.length === 0;
  }
  isGameRunning(): boolean {
    return this.gameState === "ingame";
  }

  getPlayer(sid: string): IPlayer | undefined {
    return this.players.find((player) => player.sid === sid);
  }
  getPlayerIndex(sid: string): number | undefined {
    const index = this.players.findIndex((player) => player.sid === sid);
    return index; // index or -1
  }
  updateGameSettings(newSettings: IGameSettings): IGameSettings {
    if (
      newSettings.maxPlayers > MIN_PLAYERS &&
      newSettings.maxPlayers < MAX_PLAYERS
    ) {
      this.gameSettings = { ...newSettings };
      if (newSettings.password) delete this.gameSettings.password;
    }
    return this.gameSettings;
  }
  getGameDTO(sid?: string): IGameDTO {
    const selfIndex = this.getPlayerIndex(sid);

    const playersDTO: IPlayerDTO[] = this.getPlayers().map((player, index) => {
      const playerDTO = {
        username: player.username,
        score: player.score,
        guesses: player.guessesLeft,
        state: player.playerState,
        guessHistory: player.guessHistory.map((historyObject) => {
          const newHistoryObject = { ...historyObject };
          if (selfIndex !== -1 && index !== selfIndex) {
            delete newHistoryObject.word;
          }

          return newHistoryObject;
        }),
      };

      return playerDTO;
    });

    const gameDTO: IGameDTO = {
      gameState: this.gameState,
      gameSettings: { ...this.gameSettings },
      leaderIndex: this.leaderIndex,
      selfIndex: selfIndex,
      players: playersDTO,
      roundStart: this.roundStart,
      currentRound: this.currentRound,
    };
    delete gameDTO.gameSettings.password;

    return gameDTO;
  }
  getTimeLeft() {
    // this.timeout.getTime()
    // return Math.ceil(
    //   (this.timeout._idleStart + this.timeout._idleTimeout - Date.now()) / 1000
    // );
  }

  reducePlayerGuesses(sid: string) {
    const player = this.getPlayer(sid);
    player.guessesLeft--;

    if (player.guessesLeft === 0) {
      this.changePlayerState(sid, "waiting");
    }
  }
  changePlayerState(sid: string, newState: PlayerState) {
    const player = this.getPlayer(sid);
    player.playerState = newState;

    const playerStates = this.players.map((p) => p.playerState);
    if (!playerStates.includes("guessing")) {
      //TODO Start next Round because all players are waiting
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = undefined;

        if (this.currentRound < this.gameSettings.rounds) {
          this.currentRound++;
          this.startRound();
        } else {
          this.gameState = "lobby";

          this.SendMessageToPlayers(
            "update_lobby",
            this.players,
            this.players.reduce((acc, { sid }) => {
              acc[sid] = { [this.gid]: this.getGameDTO(sid) };
              return acc;
            }, {} as TPayloadMap)
          );
          this.SendMessageToPlayers("reset_round", this.players);

          console.info("game finished");
        }
      }
    }
  }
  calculateScore(player: IPlayer) {
    const currentTime = new Date().getTime();
    const timePassed = (currentTime - this.roundStart) / 1000;
    const timeLeft = this.gameSettings.time - timePassed;

    const timePercentage = (timeLeft / this.gameSettings.time) * 100;
    const score =
      player.score + Math.floor(timePercentage) * player.guessesLeft;
    return score;
  }

  compareWord(guess: string, solution: string): TFeedback[] {
    const matches = new Array<TFeedback>(5).fill("mismatch");

    for (let i = 0; i < guess.length; i++) {
      const g = guess[i];
      const s = solution[i];

      if (g === s) {
        matches[i] = "match";
      }
    }

    const gRemain = new Map<string, number>();
    const sRemain = new Map<string, number>();
    const reassignable: Map<string, number> = new Map();

    for (let i = 0; i < guess.length; i++) {
      const g = guess[i];
      const s = solution[i];

      if (matches[i] !== "match") {
        gRemain.set(g, (gRemain.get(g) || 0) + 1);
        sRemain.set(s, (sRemain.get(s) || 0) + 1);
      }
    }

    for (const [g, num_g] of gRemain) {
      const num_s = sRemain.get(g) || 0;
      reassignable.set(g, Math.min(num_g, num_s));
    }

    for (let i = 0; i < guess.length; i++) {
      const g = guess[i];

      if (matches[i] !== "match" && reassignable.get(g)) {
        matches[i] = "misplace";
        reassignable.set(g, (reassignable.get(g) || 0) - 1);
      }
    }

    return matches;
  }

  checkGuess(
    sid: string,
    guess: string
  ): { evaluation: "correct" | "incorrect" | "invalid"; result?: TFeedback[] } {
    const player = this.getPlayer(sid);

    if (IsInList(guess)) {
      if (this.getCurrentWord() === guess) {
        player.score = this.calculateScore(player);
        console.log(player.guessHistory);
        const result: TFeedback[] = [
          "match",
          "match",
          "match",
          "match",
          "match",
        ];
        player.guessHistory.push({
          result,
          word: guess,
        });
        console.log(player.guessHistory);
        this.changePlayerState(sid, "waiting");

        return { evaluation: "correct", result };
      } else {
        this.reducePlayerGuesses(sid);

        const result = this.compareWord(guess, this.getCurrentWord());
        player.guessHistory.push({
          result,
          word: guess,
        });
        console.log(player.guessHistory);
        return { evaluation: "incorrect", result };
      }
    } else {
      return { evaluation: "invalid" };
    }
  }
}
