import { useContext, useEffect, useState } from "react";
import SocketContext from "../../context/Socket/context";
import { useNavigate } from "react-router-dom";

const GameCreator = () => {
  const { socket } = useContext(SocketContext).SocketState;
  const [gameName, setGameName] = useState<string>("");
  const [gamePassword, setGamePassword] = useState<string>("");
  const [gameMaxPlayers, setGameMaxPlayers] = useState<number>(4);
  const navigate = useNavigate();
  //GameState Context

  //create a lobby + join
  const createGame = () => {
    socket?.emit(
      "create_game",
      {
        name: gameName,
        password: gamePassword,
        maxPlayers: gameMaxPlayers,
      }
      // , dont need this if we redirect in update_gid
      // (gid: string) => {
      //   //route link to gid
      //   //navigate(`/game/${gid}`);
      // }
    );
  };

  //join a specific lobby
  const joinGame = () => {
    socket?.emit("join_game", { gid: "game id" });
  };

  //invite a player
  const invitePlayer = () => {
    socket?.emit("invite_player", { uid: "other player" });
  };
  //kick a player from game/lobby
  const kickPlayer = () => {
    socket?.emit("kick_player", { uid: "other player" });
  };
  //promote a player to leader
  const promotePlayer = () => {
    socket?.emit("promote_player", { uid: "other player" });
  };

  return (
    <div className="py-4 ">
      <label htmlFor="my-modal" className="btn btn-wide btn-primary">
        Create Game
      </label>
      <input type="checkbox" id="my-modal" className=" modal-toggle" />
      <label htmlFor="my-modal" className="cursor-pointer modal">
        <label className="relative flex flex-col items-center max-w-xs gap-2 modal-box">
          <h1 className="pb-2 text-2xl font-bold">Game Settings</h1>
          <input
            type="text"
            placeholder="Game Name"
            className="w-full max-w-xs input input-bordered focus:input-primary"
            value={gameName}
            onChange={(ev) => setGameName(ev.target.value)}
          />
          <input
            type="password"
            placeholder="Game Password"
            className="w-full max-w-xs input input-bordered focus:input-primary"
            value={gamePassword}
            onChange={(ev) => setGamePassword(ev.target.value)}
          />
          <input
            type="number"
            placeholder="Max Players"
            className="w-full max-w-xs input input-bordered focus:input-primary"
            value={gameMaxPlayers}
            min={2}
            max={20}
            onChange={(ev) => setGameMaxPlayers(Number(ev.target.value))}
          />

          <div className="modal-action">
            <button className="btn btn-wide btn-primary" onClick={createGame}>
              {/* 
            Wie kann ich das modal schließen nach Create?
            */}
              Create
            </button>
          </div>
        </label>
      </label>
    </div>
  );
};

export default GameCreator;
