import { useContext, useEffect, useState } from "react";
import SocketContext from "../../context/Socket/context";
import { useNavigate } from "react-router-dom";

const GameCreator = () => {
  const { socket } = useContext(SocketContext).SocketState;
  const [gameName, setGameName] = useState<string>("");
  const [gamePassword, setGamePassword] = useState<string>("");
  const [gameMaxPlayers, setGameMaxPlayers] = useState<number>(4);
  const [gameRounds, setGameRounds] = useState<number>(1);
  const [gameGuessesPerRound, setGPR] = useState<number>(5);
  const [gameTimePerRound, setTimePerRound] = useState<number>(90);
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
        rounds: gameRounds,
        guesses: gameGuessesPerRound,
        time: gameTimePerRound,
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

          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Game Name
              </span>
              <input
                type="text"
                placeholder="Game of Username"
                className=" input input-bordered focus:input-primary"
                value={gameName}
                onChange={(ev) => setGameName(ev.target.value)}
              />
            </label>
          </div>

          {/* <div className="w-full max-w-xs form-control ">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Game Password
              </span>
              <input
                type="password"
                placeholder="Type Password"
                className=" input input-bordered focus:input-primary"
                value={gamePassword}
                onChange={(ev) => setGamePassword(ev.target.value)}
              />
            </label>
          </div> */}

          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Max Players
              </span>
              <input
                type="number"
                placeholder="Game of Username"
                className="input input-bordered focus:input-primary"
                value={gameMaxPlayers}
                min={1}
                max={20}
                onChange={(ev) => setGameMaxPlayers(Number(ev.target.value))}
              />
            </label>
          </div>
          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">Rounds</span>
              <input
                type="number"
                placeholder="Rounds"
                className="input input-bordered focus:input-primary"
                value={gameRounds}
                min={1}
                max={10}
                onChange={(ev) => setGameRounds(Number(ev.target.value))}
              />
            </label>
          </div>
          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Guesses Per Round
              </span>
              <input
                type="number"
                placeholder="Guesses Per Player"
                className="input input-bordered focus:input-primary"
                value={gameGuessesPerRound}
                min={1}
                max={10}
                onChange={(ev) => setGPR(Number(ev.target.value))}
              />
            </label>
          </div>
          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Round Length
              </span>
              <select
                className=" select select-primary"
                onChange={(ev) => setTimePerRound(Number(ev.target.value))}
                defaultValue={gameTimePerRound}
              >
                <option disabled>Choose Round Length...</option>
                {[0, 60, 70, 80, 90, 100, 110, 120].map((time) => (
                  <option key={time} value={time}>
                    {time === 0 ? "Infinite" : `${time} Seconds`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="modal-action">
            <button className="btn btn-wide btn-primary" onClick={createGame}>
              Create
            </button>
          </div>
        </label>
      </label>
    </div>
  );
};

export default GameCreator;
