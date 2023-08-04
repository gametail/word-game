import React, { PropsWithChildren, useEffect, useReducer } from "react";
import { useSocket } from "../../hooks/useSocket";
import {
  defaultSocketContextState,
  ILobby,
  IUser,
  SocketContextProvider,
  SocketReducer,
} from "./context";
import { useNavigate } from "react-router-dom";

interface ISocketContextComponentProps extends PropsWithChildren {}

const SocketContextComponent: React.FC<ISocketContextComponentProps> = ({
  children,
}) => {
  const [SocketState, SocketDispatch] = useReducer(
    SocketReducer,
    defaultSocketContextState
  );
  const navigate = useNavigate();

  // const [loading, setLoading] = useState(true);

  // const socket = useSocket("ws://localhost:3001", {
  // const socket = useSocket("ws://172.20.0.59:3001", {
  const socket = useSocket("ws://192.168.178.21:3001", {
    reconnectionAttempts: 5,
    reconnectionDelay: 5000,
    autoConnect: false,
  });

  useEffect(() => {
    // Connect to the websocket
    socket.connect();

    //Save the socket in context
    SocketDispatch({ type: "update_socket", payload: socket });

    //Start the event listeners
    StartListeners();

    //send the handshake
    SendHandshake();
  }, []);

  const StartListeners = () => {
    //USER EVENTS
    //User connected event
    socket.on("user_connected", (users: IUser) => {
      console.info("User connected, new user list received");
      SocketDispatch({ type: "update_users", payload: users });
    });

    //User disconnected event
    socket.on("user_disconnected", (uid: string) => {
      console.info("User disconnected");
      SocketDispatch({ type: "remove_user", payload: uid });
    });

    //update lobbies event
    socket.on("update_lobbies", (lobbies: { [gid: string]: ILobby }) => {
      console.info("lobbies updated");
      SocketDispatch({ type: "update_lobbies", payload: lobbies });
    });

    //update lobbies event
    socket.on("update_lobby", (lobby: { [gid: string]: ILobby }) => {
      // SocketDispatch({ type: "update_lobby", payload: lobby });
      SocketDispatch({ type: "update_lobby", payload: lobby });
    });

    socket.on("remove_lobby", (gid: string) => {
      console.info(`removed lobby ${gid}`);

      // SocketDispatch({ type: "update_lobby", payload: lobby });
      SocketDispatch({ type: "remove_lobby", payload: gid });
    });

    //update gid event
    socket.on("update_gid", (gid: string) => {
      console.info("updated gid");
      SocketDispatch({ type: "update_gid", payload: gid });
      navigate(`/game`);
      // navigate(`/game/${gid}`);
    });

    //SERVER EVENTS
    //Reconnect event
    socket.io.on("reconnect", (attempt) => {
      console.info(`Reconnected on attempt: ${attempt}`);
    });

    //Reconnect attempt event
    socket.io.on("reconnect_attempt", (attempt) => {
      console.info(`Reconnected attempt: ${attempt}`);
    });

    //Reconnection error
    socket.io.on("reconnect_error", (error) => {
      console.info(`Reconnection error: ${error}`);
    });

    //Reconnection failed
    socket.io.on("reconnect_failed", () => {
      console.info(`Reconnection failed`);
      alert("unable to connect to the web socket.");
    });
  };

  const SendHandshake = () => {
    console.info(`Sending handshake to server ...`);
    socket.emit(
      "handshake",
      (
        uid: string,
        username: string,
        users: { [uid: string]: string },
        lobbies: { [gid: string]: ILobby }
      ) => {
        console.info("User handshake callback message received");
        SocketDispatch({ type: "update_uid", payload: uid });
        SocketDispatch({ type: "update_username", payload: username });
        SocketDispatch({ type: "update_users", payload: users });
        SocketDispatch({ type: "update_lobbies", payload: lobbies });
      }
    );
  };

  return (
    <SocketContextProvider value={{ SocketState, SocketDispatch }}>
      {children}
    </SocketContextProvider>
  );
};

export default SocketContextComponent;
