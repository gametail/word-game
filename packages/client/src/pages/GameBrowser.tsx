import { useContext, useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import SocketContext from "../context/Socket/context";

const GameBrowser = () => {
  const { lobbies, socket } = useContext(SocketContext).SocketState;

  const [currentPage, setCurrentPage] = useState(1);
  const lobbiesPerPage = 10;
  const lastIndex = currentPage * lobbiesPerPage;
  const firstIndex = lastIndex - lobbiesPerPage;
  const displayedLobbies = Object.entries(lobbies)
    .slice(firstIndex, lastIndex)
    .map(([gid, lobby]) => ({ gid, ...lobby }));
  const lobbiesLength = Object.keys(lobbies).length;

  const fillerElements = [
    ...Array(lobbiesPerPage - displayedLobbies.length),
  ].map((item, index) => {
    return (
      <tr key={index}>
        <td className="w-24 text-center ">-</td>
        <td className="w-32 text-center ">-</td>
        <td>-</td>
        <td className="w-32 text-center ">-</td>
        <td className="w-24 text-center">-</td>
      </tr>
    );
  });

  const joinGame = (gid: string) => {
    socket?.emit("join_game", gid);
  };

  return (
    <div className="flex flex-col h-full ">
      <table className="table w-full table-zebra ">
        {/* head */}
        <thead>
          <tr>
            <th className="w-24 text-center ">#</th>
            <th className="w-32 text-center ">Game Status</th>
            <th>Lobby Name</th>
            <th className="w-32 text-center ">Owner</th>
            <th className="w-24 text-center">Players</th>
          </tr>
        </thead>
        <tbody>
          {displayedLobbies.map((item, index) => {
            const { gid, gameSettings, gameState, leaderIndex, players } = item;

            const statusColor = {
              initializing: "text-error",
              lobby: "text-success",
              ingame: "text-warning",
            };

            return (
              <tr key={index} onClick={() => joinGame(gid)}>
                <td className="w-24 text-center ">{firstIndex + index + 1}</td>
                <td
                  className={`w-32 text-center capitalize ${statusColor[gameState]}`}
                >
                  {gameState}
                </td>
                <td>{gameSettings.name}</td>
                <td className="w-32 text-center ">
                  {players[leaderIndex].username}
                </td>
                <td className="w-24 text-center">{`${players.length}/${gameSettings.maxPlayers}`}</td>
              </tr>
            );
          })}
          {fillerElements}
        </tbody>
      </table>

      {lobbiesLength > 0 && (
        <Pagination
          totalItems={lobbiesLength}
          itemsPerPage={lobbiesPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default GameBrowser;
