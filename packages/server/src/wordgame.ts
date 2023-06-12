import { ILobby } from "./frontend_types";
import { IUser } from "./socket";
import { IsInList, getRandomWord } from "./words";

export type PlayerState = "guessing" | "waiting";
export interface IPlayer extends IUser {
  guessesLeft: number;
  playerState: PlayerState;
  score: number;
}
type Feedback = "match" | "misplace" | "mismatch";

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
}

export class WordGame {
  players: IPlayer[];
  leaderIndex: number;
  gameState: GameState = "initializing";
  gameSettings: IGameSettings = DEFAULT_GAMESETTINGS;
  timeout: NodeJS.Timeout | undefined;
  currentRound: number;
  roundStart: number | undefined;
  word: string;

  constructor(gameSettings?: IGameSettings) {
    this.players = [];
    this.gameState = "lobby";
    this.leaderIndex = 0;
    this.currentRound = 1;
    this.roundStart = undefined;
    this.word = "";
    this.timeout = undefined;

    if (gameSettings) this.gameSettings = gameSettings;
  }

  start(sid: string, roundEnd: () => void, gameFinish: () => void): boolean {
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

      this.startRound(roundEnd, gameFinish);

      return true;
    } else {
      console.info(`cant start game ${sid} is not leader`);
      return false;
    }
  }

  startRound(roundEnd: () => void, gameFinish: () => void) {
    this.players.forEach((player) => (player.playerState = "guessing"));

    this.word = getRandomWord();
    this.roundStart = new Date().getTime();

    setTimeout(() => {
      if (this.currentRound < this.gameSettings.rounds) {
        this.currentRound++;
        roundEnd();
        this.startRound(roundEnd, gameFinish);
      } else {
        this.gameState = "lobby";
        console.info("game finished");
        gameFinish();
      }
    }, this.gameSettings.time * 1000);
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
    const playersDTO: IPlayerDTO[] = this.getPlayers().map((player) => {
      return {
        username: player.username,
        score: player.score,
        guesses: player.guessesLeft,
        state: player.playerState,
      };
    });

    const selfIndex = this.getPlayerIndex(sid);

    const gameDTO: IGameDTO = {
      gameState: this.gameState,
      gameSettings: { ...this.gameSettings },
      leaderIndex: this.leaderIndex,
      selfIndex,
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

  compareWord(guess: string, solution: string): Feedback[] {
    const matches = new Array<Feedback>(5).fill("mismatch");

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
  ): {
    correct: boolean;
    result?: Feedback[];
    invalid: boolean;
  } {
    const player = this.getPlayer(sid);

    if (IsInList(guess)) {
      if (this.word === guess) {
        player.score = this.calculateScore(player);
        this.changePlayerState(sid, "waiting");

        return {
          correct: true,
          result: ["match", "match", "match", "match", "match"],
          invalid: false,
        };
      } else {
        this.reducePlayerGuesses(sid);

        const result = this.compareWord(guess, this.word);
        return {
          correct: false,
          result,
          invalid: false,
        };
      }
    } else {
      return { correct: false, invalid: true };
    }
  }

  // updateScore(pid: string, scoreDelta: number): void {
  //   const player = this.getPlayer(pid);
  //   if (player) {
  //     player.score += scoreDelta;
  //   }
  // }

  // getScore(pid: string): number | undefined {
  //   const player = this.getPlayer(pid);
  //   if (player) {
  //     return player.score;
  //   }
  //   return undefined;
  // }
}
