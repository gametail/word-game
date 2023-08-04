import { useContext, useEffect, useState } from "react";
import UserAvatar from "../UserAvatar";
import SocketContext, {
  IGameSnapshot,
  IPlayerDTO,
} from "../../context/Socket/context";
import PostGame from "../PostGame";

const Lobby = () => {
  const { gid, lobbies, socket } = useContext(SocketContext).SocketState;
  const [postGameAvailable, setPostGameAvailable] = useState<boolean>(false);
  const [showPostGameTab, setShowPostGameTab] = useState<boolean>(false);

  let users: IPlayerDTO[] = [];
  let leaderIndex: number = -1;
  let selfIndex: number = -1;
  let lastGameSnapshot: IGameSnapshot | undefined = undefined;

  if (gid) {
    users = lobbies[gid]?.players;
    leaderIndex = lobbies[gid]?.leaderIndex;
    selfIndex = lobbies[gid]?.selfIndex;
    lastGameSnapshot = lobbies[gid]?.lastGameSnapshot;
  }
  useEffect(() => {
    setPostGameAvailable(!!lastGameSnapshot);
  }, [lastGameSnapshot]);

  useEffect(() => {
    if (!socket) return;

    socket.on("show_postgame", () => {
      setShowPostGameTab(true);
    });
  }, []);

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
      <div className="my-2 tabs">
        <a
          className={`tab tab-lg tab-bordered ${
            showPostGameTab ? "" : "tab-active"
          }`}
          onClick={() => setShowPostGameTab(false)}
        >
          Lobby
        </a>
        <a
          className={`tab tab-lg tab-bordered ${
            showPostGameTab ? "tab-active" : ""
          } ${postGameAvailable ? "" : "tab-disabled"}`}
          onClick={() => postGameAvailable && setShowPostGameTab(true)}
        >
          Post-game
        </a>
      </div>
      {showPostGameTab ? (
        <PostGame />
      ) : (
        <div className="flex flex-col items-center">
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
            <button
              className="btn b btn-primary"
              onClick={() => leaveGame(gid)}
            >
              Leave
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lobby;
