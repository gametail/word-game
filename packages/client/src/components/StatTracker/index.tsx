import { useContext } from "react";
import SocketContext from "../../context/Socket/context";

const StatTracker = () => {
  const { lobbies, gid } = useContext(SocketContext).SocketState;
  const lobby = lobbies[gid];

  return (
    <div className="shadow stats bg-base-200">
      <div className="px-4 py-2 stat place-items-center">
        <div className="stat-figure text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Round</div>
        <div className="stat-value text-primary">{lobby.currentRound}</div>
        <div className="stat-desc">
          {lobby.gameSettings.rounds - lobby.currentRound} rounds left
        </div>
      </div>

      <div className="px-4 py-2 stat place-items-center">
        <div className="stat-figure text-secondary ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Guesses Left</div>
        <div className="stat-value text-secondary">
          {lobby.players[lobby.selfIndex].guesses}
        </div>
        <div className="stat-desc">
          of total {lobby.gameSettings.guesses} guesses
        </div>
      </div>
      <div className="px-4 py-2 stat place-items-center">
        <div className="stat-figure text-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="inline-block w-8 h-8 stroke-current"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <div className="stat-title">Score</div>
        <div className="stat-value text-info">
          {lobby.players[lobby.selfIndex].score}
        </div>
        <div className="stat-desc">placing you at #1</div>
      </div>
    </div>
  );
};

export default StatTracker;
