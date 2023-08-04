import { useContext, useEffect, useRef, useState } from "react";
import Pagination from "../components/Pagination";
import SocketContext from "../context/Socket/context";
import { RiLock2Line } from "react-icons/ri";

const GameBrowser = () => {
  const { lobbies, socket } = useContext(SocketContext).SocketState;

  const dialogRef = useRef<HTMLDialogElement>(null);

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
        <td className="w-24 text-center">-</td>
      </tr>
    );
  });

  const joinGame = (gid: string, password?: string) => {
    socket?.emit("join_game", { gid, password });
  };

  return (
    <div className="flex flex-col h-full ">
      <button className="btn" onClick={() => dialogRef.current?.showModal()}>
        open modal
      </button>
      <dialog ref={dialogRef} id="hello" className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="text-lg font-bold">Hello!</h3>
          <p className="py-4">Press ESC key or click outside to close</p>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <table className="table w-full grow table-zebra">
        {/* head */}
        <thead>
          <tr>
            <th className="w-24 text-center ">#</th>
            <th className="w-32 text-center ">Game Status</th>

            <th>Lobby Name</th>
            <th className="w-32 text-center ">Owner</th>
            <th className="w-24 text-center">Players</th>
            <th>Password</th>
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
              // <tr className=" hover" key={index} onClick={() => joinGame(gid)}>
              <tr
                className=" hover"
                key={index}
                onClick={() => dialogRef.current?.showModal()}
              >
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
                <td className="w-24 text-center">
                  {gameSettings.password ? (
                    <RiLock2Line className="mx-auto" size={25} />
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            );
          })}
          {fillerElements}
        </tbody>
      </table>

      {lobbiesLength > 1 && (
        <Pagination
          className="my-2 "
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
