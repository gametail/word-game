import { useContext, useEffect } from "react";
import UserAvatar from "../UserAvatar";
import SocketContext from "../../context/Socket/context";
import GameCreator from "../GameCreator";
import { Link } from "react-router-dom";

const Lobby = () => {
  const { gid, lobbies, socket } = useContext(SocketContext).SocketState;

  let users: string[] = [];
  let leaderIndex: number = -1;
  let selfIndex: number | undefined;

  if (gid) {
    users = lobbies[gid]?.players;
    leaderIndex = lobbies[gid]?.leaderIndex;
    selfIndex = lobbies[gid]?.selfIndex;
  }

  //leave current lobby/game
  const leaveGame = (gid: string) => {
    socket?.emit("leave_game", gid);
  };
  //start the game
  const startGame = () => {
    socket?.emit("start_game");
  };

  return gid ? (
    <div className="flex flex-col items-center h-full">
      {gid && (
        <h1 className="my-6 text-4xl font-bold">
          {lobbies[gid].gameSettings.name}
        </h1>
      )}
      <div className="flex justify-center gap-10 my-8">
        {users?.map((user, index) => {
          return (
            <UserAvatar
              key={index}
              name={user}
              self={index === selfIndex}
              leader={index === leaderIndex}
            />
          );
        })}
      </div>
      <div className="flex gap-6">
        {selfIndex === leaderIndex && (
          <button className="btn btn-primary" onClick={startGame}>
            Start Game
          </button>
        )}
        <button className="btn b btn-primary" onClick={() => leaveGame(gid)}>
          Leave
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="my-5 text-4xl font-bold">You must join a lobby first.</h1>
      <GameCreator />
      <Link to="/browser" className="btn btn-wide btn-primary">
        Browser
      </Link>
    </div>
  );
};

export default Lobby;
