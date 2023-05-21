import { ILobby } from "./frontend_types";
import { IUser } from "./socket";

export interface IPlayer extends IUser {
  score: number;
}

const MAX_PLAYERS = 20;
const MIN_PLAYERS = 2;

export type GameState = "initializing" | "lobby" | "ingame";

export interface IGameSettings {
  name: string;
  password?: string;
  maxPlayers: number;
}
export interface IGameDTO {
  gameState: GameState;
  gameSettings: IGameSettings;
  leaderIndex: number;
  selfIndex?: number;
  players: string[];
}

export class WordGame {
  players: IPlayer[];
  leaderIndex: number;
  gameState: GameState = "initializing";
  gameSettings: IGameSettings = { name: "no-name", maxPlayers: 4 };

  constructor(gameSettings?: IGameSettings) {
    this.players = [];
    this.gameState = "lobby";
    this.leaderIndex = 0;

    if (gameSettings) this.gameSettings = gameSettings;
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

    this.players.push({ ...user, score: 0 });
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
    return index >= 0 ? index : undefined;
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
    const playersDTO: string[] = this.getPlayers().map(
      (player) => player.username
    );

    const selfIndex = this.getPlayerIndex(sid);

    const gameDTO: IGameDTO = {
      gameState: this.gameState,
      gameSettings: { ...this.gameSettings },
      leaderIndex: this.leaderIndex,
      selfIndex,
      players: playersDTO,
    };
    delete gameDTO.gameSettings.password;

    return gameDTO;
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

// Grün Buchstabe ist an der richtigen Stelle
// Gelb Buchstabe ist im Wort enthalten aber an einer anderen Stelle
// Grau Buchstabe kommt im Lösungwort nicht vor
