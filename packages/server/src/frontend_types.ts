import { IGameDTO } from "./wordgame";

export interface ILobby {
  [gid: string]: IGameDTO;
}
