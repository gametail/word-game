export interface ServerToClientEvents {}

export interface ClientToServerEvents {
  handshake: (
    callback: (
      uid: string,
      username: string,
      users: { [uid: string]: string },
      lobbies: { [gid: string]: IGameDTO }
    ) => void
  ) => void;
  disconnect: () => void;
  create_game: (gameSettings: IGameSettings) => void;
  join_game: (gid: string) => void;
  leave_game: (gid: string) => void;
  start_game: (gid: string) => void;
  check_guess: (guess: string) => void;
}
