import { useContext, useEffect } from "react";
import UserAvatar from "../UserAvatar";
import SocketContext, { IPlayerDTO } from "../../context/Socket/context";

const Lobby = () => {
  const { gid, lobbies, socket } = useContext(SocketContext).SocketState;

  let users: IPlayerDTO[] = [];
  let leaderIndex: number = -1;
  let selfIndex: number = -1;

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
    socket?.emit("start_game", gid);
  };

  return (
    <div className="flex flex-col items-center h-full">
      {gid && (
        <div>
          <h1 className="my-6 text-4xl font-bold text-center">
            {lobbies[gid].gameSettings.name}
          </h1>
          <h2 className="text-center ">Status:{lobbies[gid].gameState}</h2>
        </div>
      )}
      <div className="flex justify-center gap-10 my-8">
        {users?.map((user, index) => {
          return (
            <UserAvatar
              key={index}
              name={user.username}
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
  );
};

export default Lobby;
