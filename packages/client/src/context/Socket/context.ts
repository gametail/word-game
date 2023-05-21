import { Reducer, createContext } from "react";
import { Socket } from "socket.io-client";

export interface ISocketContextState {
  socket: Socket | undefined;
  uid: string;
  username: string;
  gid: string;
  users: { [uid: string]: string };
  lobbies: { [gid: string]: ILobby };
}

export const defaultSocketContextState: ISocketContextState = {
  socket: undefined,
  uid: "",
  username: "",
  gid: "",
  users: {},
  lobbies: {},
};

export interface IUser {
  [uid: string]: string;
}

export interface ILobby {
  gameState: "initializing" | "lobby" | "ingame";
  gameSettings: {
    name: string;
    maxPlayers: number;
  };
  leaderIndex: number;
  selfIndex?: number;
  // players: { uid: string; username: string }[];
  players: string[];
}

export type TSocketContextActions =
  | { type: "update_socket"; payload: Socket }
  | { type: "update_uid"; payload: string }
  | { type: "update_username"; payload: string }
  | { type: "update_users"; payload: { [uid: string]: string } }
  | { type: "remove_user"; payload: string }
  | { type: "update_gid"; payload: string }
  | { type: "update_lobbies"; payload: { [gid: string]: ILobby } }
  | { type: "update_lobby"; payload: { [gid: string]: ILobby } }
  | { type: "remove_lobby"; payload: string };

// export type TSocketContextPayload =
//   | string
//   // | IUser[]
//   | { [gid: string]: ILobby }
//   | Socket
//   | ILobby[]
//   | { gid: string; lobby: ILobby };

// export interface ISocketContextActions {
//   type: TSocketContextActions;
//   payload: TSocketContextPayload;
// }

// export const SocketReducer = (
//   state: ISocketContextState,
//   action: ISocketContextActions
// ) => {
//   console.info(
//     `Message Received - Action: ${action.type} - Payload: ${action.payload}`
//   );

//   switch (action.type) {
//     case "update_socket":
//       return { ...state, socket: action.payload as Socket };
//     case "update_uid":
//       return { ...state, uid: action.payload as string };
//     case "update_username":
//       return { ...state, username: action.payload as string };
//     case "update_users":
//       // return { ...state, users: action.payload as IUser[] };
//       return { ...state, users: action.payload as { [gid: string]: ILobby } };
//     case "remove_user":
//       delete state.users[action.payload as string];
//       return { ...state };
//     case "update_gid":
//       return { ...state, gid: action.payload as string };
//     case "update_lobbies":
//       return { ...state, lobbies: action.payload as ILobby[] };
//     case "update_lobby":
//       const { gid, lobby } = action.payload as { gid: string; lobby: ILobby };
//       state.lobbies[gid] = lobby;
//       return { ...state };
//     case "remove_lobby":
//       delete state.lobbies[action.payload as string];
//       return { ...state };
//     default:
//       return { ...state };
//   }
// };

export const SocketReducer: Reducer<
  ISocketContextState,
  TSocketContextActions
> = (state, action) => {
  switch (action.type) {
    case "update_socket":
      return {
        ...state,
        socket: action.payload as Socket,
      };
    case "update_uid":
      return {
        ...state,
        uid: action.payload as string,
      };
    case "update_username":
      return {
        ...state,
        username: action.payload as string,
      };
    case "update_users":
      return {
        ...state,
        users: action.payload as { [uid: string]: string },
      };
    case "remove_user":
      const newUsers = { ...state.users };
      delete newUsers[action.payload as string];
      return {
        ...state,
        users: newUsers,
      };
    case "update_gid":
      return {
        ...state,
        gid: action.payload as string,
      };
    case "update_lobbies":
      return {
        ...state,
        lobbies: action.payload as { [gid: string]: ILobby },
      };
    case "update_lobby":
      const [gid, lobby] = Object.entries(
        action.payload as { [gid: string]: ILobby }
      )[0];
      return {
        ...state,
        lobbies: {
          ...state.lobbies,
          [gid]: lobby,
        },
      };
    case "remove_lobby":
      const newLobbies = { ...state.lobbies };
      delete newLobbies[action.payload as string];
      return {
        ...state,
        lobbies: newLobbies,
      };
    default:
      return state;
  }
};

// export interface ISocketContextProps {
//   SocketState: ISocketContextState;
//   SocketDispatch: React.Dispatch<ISocketContextActions>;
// }
export interface ISocketContextProps {
  SocketState: ISocketContextState;
  SocketDispatch: React.Dispatch<TSocketContextActions>;
}

const SocketContext = createContext<ISocketContextProps>({
  SocketState: defaultSocketContextState,
  SocketDispatch: () => {},
});

export const SocketContextConsumer = SocketContext.Consumer;
export const SocketContextProvider = SocketContext.Provider;

export default SocketContext;
