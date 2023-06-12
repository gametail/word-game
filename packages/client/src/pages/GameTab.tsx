import { useContext } from "react";
import Lobby from "../components/Lobby";
import SocketContext from "../context/Socket/context";
import GameCreator from "../components/GameCreator";
import { Link } from "react-router-dom";
import Game from "../components/Game";

const GameTab = () => {
  const { gid, lobbies } = useContext(SocketContext).SocketState;

  const lobby = lobbies[gid];
  const gameState = lobby?.gameState;

  const renderGameState = (gameState: string) => {
    switch (gameState) {
      case "lobby":
        return <Lobby />;
      case "ingame":
        return <Game />;

      default:
        return <div>GameState doesnt exist</div>;
    }
  };

  return (
    <div className="w-screen h-screen ">
      {gid ? (
        renderGameState(gameState)
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="my-5 text-4xl font-bold">
            You must join a lobby first.
          </h1>
          <GameCreator />
          <Link to="/browser" className="btn btn-wide btn-primary">
            Browser
          </Link>
        </div>
      )}
    </div>
  );
};

export default GameTab;
