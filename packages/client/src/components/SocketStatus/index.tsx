import React, { useContext, useEffect, useState } from "react";
import SocketContext from "../../context/Socket/context";

interface ISocketStatus {
  nav?: boolean;
}

const SocketStatus: React.FC<ISocketStatus> = ({ nav }) => {
  const { socket } = useContext(SocketContext).SocketState;
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("Disconnected");

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setMessage("Connected");
    };
    socket?.on("connect", handleConnect);

    const handleConnectError = () => {
      setConnected(false);
      setMessage("Disconnected");
    };

    socket?.on("connect_error", handleConnectError);
    return () => {
      socket?.off("connect", handleConnect);
      socket?.off("connect_error", handleConnectError);
    };
  }, [socket]);

  return (
    <div
      className={` select-none stats ${nav && "ml-auto w-[200px]"} ${
        connected ? " bg-success" : " bg-error"
      } `}
    >
      <div className={` stat ${nav && "px-4 py-1"}`}>
        <div className={`"scale-[150%]" ${nav && "scale-[120%]"} stat-figure`}>
          <div>{connected ? "⚡" : "❌"}</div>
        </div>
        <div
          className={`stat-title text-xs text-center  ${
            connected ? " text-success-content" : " text-error-content"
          }`}
        >
          Socket Connection
        </div>
        <div
          className={`stat-value text-xl text-center ${
            connected ? " text-success-content" : " text-error-content"
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default SocketStatus;
