import React, { useContext } from "react";
import SocketContext from "../../context/Socket/context";

const UserList = () => {
  const { uid, username, users, socket } =
    useContext(SocketContext).SocketState;
  const uidList = Object.keys(users);

  return (
    <div className=" w-[500px] flex justify-center items-center flex-col bg-info text-info-content rounded-xl border-info-content border-4 p-6">
      <div>
        <h2 className="pb-4 text-2xl font-extrabold text-center">
          Socket IO Information
        </h2>
        Your user ID: <strong>{uid}</strong>
        <br />
        Your username: <strong>{username}</strong>
        <br />
        Socket ID: <strong>{socket?.id}</strong>
        <br />
        Users <strong>[{uidList.length}]</strong>:
        <br />
        <ul>
          {uidList.map((uid, i) => {
            return (
              <li className="font-bold " key={i}>
                {users[uid]} - [{uid}]
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default UserList;
