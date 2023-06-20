import { useContext, useEffect, useState } from "react";
import SocketContext from "../../context/Socket/context";
import {
  RiHeartLine,
  RiHeartFill,
  RiHeartPulseFill,
  RiHeartPulseLine,
  RiRefreshLine,
  RiRefreshFill,
  RiTrophyFill,
  RiTrophyLine,
} from "react-icons/ri";

const StatTracker = () => {
  const { socket, lobbies, gid } = useContext(SocketContext).SocketState;
  const lobby = lobbies[gid];
  const [playNoGuessAnim, setPlayNoGuessAnim] = useState<boolean>(false);
  const [playRoundAnim, setPlayRoundAnim] = useState<boolean>(false);
  const [playScoreAnim, setPlayScoreAnim] = useState<boolean>(false);
  const iconSize = 40;

  useEffect(() => {
    if (!socket) return;

    socket.on("no_guesses", () => {
      setPlayNoGuessAnim(true);
    });
  }, []);

  useEffect(() => {
    setPlayRoundAnim(true);
  }, [lobby.currentRound]);

  useEffect(() => {
    setPlayNoGuessAnim(true);
  }, [lobby.players[lobby.selfIndex].guesses]);

  useEffect(() => {
    setPlayScoreAnim(true);
  }, [lobby.players[lobby.selfIndex].score]);

  return (
    <div className="overflow-hidden shadow stats bg-neutral">
      <div
        className={`px-4 py-2 stat place-items-center ${
          playRoundAnim && " animate-jump"
        }`}
        onAnimationEnd={() => setPlayRoundAnim(false)}
      >
        <div className=" stat-figure text-accent">
          <RiRefreshFill size={iconSize} />
        </div>
        <div className="stat-title">Round</div>
        <div className=" stat-value text-accent">{lobby.currentRound}</div>
        <div className="stat-desc ">
          {lobby.gameSettings.rounds - lobby.currentRound} rounds left
        </div>
      </div>

      <div
        className={`px-4 py-2 stat place-items-center ${
          playNoGuessAnim && " animate-jump"
        }`}
        onAnimationEnd={() => setPlayNoGuessAnim(false)}
      >
        <div className="stat-figure text-secondary ">
          <RiHeartPulseFill size={iconSize} />
        </div>
        <div className="stat-title">Guesses Left</div>
        <div className="stat-value text-secondary">
          {lobby.players[lobby.selfIndex].guesses}
        </div>
        <div className="stat-desc">
          of total {lobby.gameSettings.guesses} guesses
        </div>
      </div>
      <div
        className={`px-4 py-2 stat place-items-center ${
          playScoreAnim && " animate-jump"
        }`}
        onAnimationEnd={() => setPlayScoreAnim(false)}
      >
        <div className=" stat-figure text-info">
          <RiTrophyFill size={iconSize} />
        </div>
        <div className="stat-title ">Score</div>
        <div className="stat-value text-info">
          {lobby.players[lobby.selfIndex].score}
        </div>
        <div className="stat-desc">placing you at #1</div>
      </div>
    </div>
  );
};

export default StatTracker;
