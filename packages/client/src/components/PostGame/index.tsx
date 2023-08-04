import { useContext, useEffect, useState } from "react";
import SocketContext, { IGameSnapshot } from "../../context/Socket/context";

const PostGame = () => {
  const { gid, lobbies, socket } = useContext(SocketContext).SocketState;

  let lastGameSnapshot: IGameSnapshot | undefined = undefined;
  let name: string = "";
  let selfIndex: number = -1;

  if (gid) {
    name = lobbies[gid]?.gameSettings.name;
    lastGameSnapshot = lobbies[gid]?.lastGameSnapshot;
    selfIndex = lobbies[gid]?.selfIndex;
  }

  return (
    <div className="flex flex-col items-center h-full ">
      <h1 className="my-6 text-4xl font-bold text-center">
        {lobbies[gid].gameSettings.name}
      </h1>
      <h2 className="text-2xl font-bold text-center">
        {`${lastGameSnapshot?.words.length} ${
          lastGameSnapshot?.words.length === 1 ? "Round" : "Rounds"
        }`}
      </h2>

      <div className="max-w-6xl my-4 overflow-x-scroll shadow stats bg-primary">
        {lastGameSnapshot?.words.map((word, index) => {
          return (
            <div key={index} className="stat">
              <div className="stat-title text-primary-content">
                Round {index + 1}
              </div>
              <div className="uppercase stat-value text-primary-content">
                {word}
              </div>
              {/* <div className="stat-desc">21% more than last month</div>s */}
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto border-2 rounded-xl border-primary">
        <table className="table w-full table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th className="text-center ">#</th>
              <th className="text-center ">Player</th>
              <th className="text-center ">Score</th>
            </tr>
          </thead>
          <tbody>
            {lastGameSnapshot?.players
              .sort((a, b) => b.score - a.score)
              .map((player, index) => {
                const { username, score } = player;

                return (
                  <tr className=" hover" key={index}>
                    <td className="text-center ">{index + 1}</td>
                    <td
                      className={`${
                        selfIndex === index
                          ? " items-center gap-2 indicator"
                          : ""
                      }`}
                    >
                      {username}
                      {selfIndex === index && (
                        <span className="font-bold badge badge-primary">
                          You
                        </span>
                      )}
                    </td>
                    <td className="text-center">{score}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PostGame;
