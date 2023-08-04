import { useContext, useEffect, useRef, useState } from "react";
import Pagination from "../components/Pagination";
import SocketContext from "../context/Socket/context";
import { RiLock2Line } from "react-icons/ri";

const GameBrowser = () => {
  const { lobbies, socket } = useContext(SocketContext).SocketState;

  const passwordDialogRef = useRef<HTMLDialogElement>(null);
  const [gameNameDialog, setGameNameDialog] = useState("");
  const [gidDialog, setGidDialog] = useState("");
  const [passwordDialog, setPasswordDialog] = useState("");

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
  ].map((_, index) => {
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
      <dialog ref={passwordDialogRef} id="hello" className="modal">
        <form
          method="dialog"
          className="flex flex-col items-center justify-center gap-2 w-fit modal-box"
        >
          <h3 className="text-xl font-bold">{gameNameDialog}</h3>
          <div className="w-full max-w-xs form-control">
            <label className=" input-group input-group-vertical">
              <span className=" bg-primary text-primary-content">
                Game Password
              </span>
              <input
                type="password"
                placeholder="Enter Room Password"
                className="input input-primary input-bordered focus:input-primary"
                value={passwordDialog}
                onChange={(ev) => setPasswordDialog(ev.target.value)}
                onKeyDown={({ key }) => {
                  if (passwordDialogRef.current?.open && key === "Enter") {
                    joinGame(gidDialog, passwordDialog);
                  }
                }}
              />
            </label>
          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      <table className="table w-full grow table-zebra">
        {/* head */}
        <thead>
          <tr className="text-xl">
            <th className="w-24 text-center">#</th>
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
              initializing: "error",
              lobby: "success",
              ingame: "warning",
            };

            return (
              // <tr className=" hover" key={index} onClick={() => joinGame(gid)}>
              <tr
                className=" hover"
                key={index}
                onClick={() => {
                  if (gameSettings.password) {
                    setGidDialog(gid);
                    setGameNameDialog(gameSettings.name);
                    passwordDialogRef.current?.showModal();
                  } else {
                    joinGame(gid);
                  }
                }}
              >
                <td className="w-24 text-center ">{firstIndex + index + 1}</td>
                <td>
                  <div
                    className={` w-32 capitalize badge badge-lg badge-${statusColor[gameState]}`}
                  >
                    {gameState}
                  </div>
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
