import { useContext, useEffect, useState } from "react";
import SocketContext from "../context/Socket/context";
import { Link } from "react-router-dom";
import {
  RiCheckboxCircleFill,
  RiDeleteBack2Fill,
  RiHeartPulseFill,
  RiInputMethodLine,
  RiRefreshFill,
  RiTrophyFill,
} from "react-icons/ri";
// import UserList from "../components/UserList";

const Home = () => {
  const { socket } = useContext(SocketContext).SocketState;
  const [username, setUsername] = useState<string>("");
  const [invalidUsername, setInvalidUsername] = useState<boolean>(false);
  const [namechangeSuccess, setNamechangeSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) return;
    socket.on("namechange_success", () => {
      setNamechangeSuccess(true);
      console.log("success");
    });
  }, [socket]);

  const changeUsername = () => {
    if (username.length >= 2 && username.length <= 16) {
      socket?.emit("change_username", username);
    }
  };

  return (
    <>
      {/* <UserList /> */}
      <div className="w-screen h-screen hero ">
        <div className="fixed flex gap-10 select-none ">
          <div className="grid grid-rows-5 gap-4 p-4 text-6xl font-extrabold text-center capitalize rounded-2xl bg-primary ">
            <div className="flex row-start-2 row-end-2 gap-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                v
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                i
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                d
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                e
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                o
              </div>
            </div>
            <div className="flex row-start-3 row-end-3 gap-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-warning text-warning-content">
                r
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-warning text-warning-content">
                u
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-warning text-warning-content">
                s
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                t
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                y
              </div>
            </div>
            <div className="flex row-start-4 row-end-4 gap-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                c
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                r
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                o
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                o
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-neutral text-neutral-content">
                k
              </div>
            </div>
            <div className="flex row-start-5 row-end-5 gap-4">
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                c
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                r
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                u
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                s
              </div>
              <div className="flex items-center justify-center w-24 h-24 rounded-2xl bg-success text-success-content">
                h
              </div>
            </div>
          </div>
          <div>
            <h1 className="flex flex-col items-center text-2xl font-bold">
              <span className="mb-2 text-4xl font-bold ">00:56</span>

              <div className="overflow-hidden shadow select-none stats bg-neutral">
                <div className="px-4 py-2 stat place-items-center">
                  <div className=" stat-figure text-accent">
                    <RiRefreshFill size={40} />
                  </div>
                  <div className="stat-title text-neutral-content">Round</div>
                  <div className=" stat-value text-accent">2</div>
                  <div className="stat-desc text-neutral-content ">
                    2 rounds left
                  </div>
                </div>

                <div className="px-4 py-2 stat place-items-center">
                  <div className="stat-figure text-secondary ">
                    <RiHeartPulseFill size={40} />
                  </div>
                  <div className="stat-title text-neutral-content">
                    Guesses Left
                  </div>
                  <div className="stat-value text-secondary">1</div>
                  <div className="stat-desc text-neutral-content">
                    of total 5 guesses
                  </div>
                </div>
                <div className="px-4 py-2 stat place-items-center">
                  <div className=" stat-figure text-info">
                    <RiTrophyFill size={40} />
                  </div>
                  <div className="stat-title text-neutral-content ">Score</div>
                  <div className="stat-value text-info">0</div>
                  <div className="stat-desc text-neutral-content">
                    placing you at #1
                  </div>
                </div>
              </div>
            </h1>
            <div className="pointer-events-none ">
              <div className="flex gap-4 p-2 mt-2 text-6xl font-extrabold text-center capitalize">
                <div className="w-24 h-24 rounded-2xl input input-bordered input-primary" />
                <div className="w-24 h-24 rounded-2xl input input-bordered input-primary" />
                <div className="w-24 h-24 rounded-2xl input input-bordered input-primary" />
                <div className="w-24 h-24 rounded-2xl input input-bordered input-primary" />
                <div className="w-24 h-24 rounded-2xl input input-bordered input-primary" />
              </div>
              <div className="flex w-full mb-2 select-none justify-evenly">
                <div className="flex items-center font-semibold uppercase">
                  <RiInputMethodLine
                    className="mr-1 border border-primary text-success-content bg-success"
                    size={25}
                  />
                  =correct
                </div>
                <div className="flex items-center font-semibold uppercase">
                  <RiInputMethodLine
                    className="mr-1 border border-primary text-warning-content bg-warning"
                    size={25}
                  />
                  =misplace
                </div>
                <div className="flex items-center font-semibold uppercase">
                  <RiInputMethodLine
                    className="mr-1 border border-primary text-neutral-content bg-neutral"
                    size={25}
                  />
                  =mismatch
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 ">
                {[
                  ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
                  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                  ["Y", "X", "C", "V", "B", "N", "M"],
                ].map((row, i) => (
                  <div className="flex gap-2 " key={i}>
                    {row.map((key, i2) => {
                      return (
                        <div
                          key={`${i}${i2}`}
                          className="text-xl font-bold btn btn-square "
                        >
                          {key}
                        </div>
                      );
                    })}
                  </div>
                ))}
                <div className="flex gap-2 ">
                  <div className="w-32 h-12 btn btn-primary">
                    <RiDeleteBack2Fill className="text-2xl " />
                  </div>
                  <div className="w-32 h-12 btn btn-primary">
                    <RiCheckboxCircleFill className="text-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 w-full h-full bg-neutral bg-opacity-80"></div>
        <div className="z-20 fixed h-[2000px] rotate-[20deg] bg-white w-[60%] bg-opacity-20"></div>

        <div className="z-30 text-center hero-content text-neutral-content">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold">
              Play Solo or Challenge Friends in the Ultimate Word Game
              Adventure!
            </h1>
            <p className="py-4">
              Delve into the enigmatic world of Word Battle, where your
              linguistic prowess takes center stage. As you crack the code and
              decipher each word, a sense of accomplishment awaits you like no
              other. Compete in real-time against your pals or take turns at
              your convenience. Witness moments of excitement as you race
              against the clock to outsmart each other and become the ultimate
              Word Battle champion.
            </p>

            <div className="form-control">
              <div
                className={`tooltip   ${
                  invalidUsername ? "tooltip-open tooltip-error" : ""
                }`}
                data-tip="Username must have 2-16 characters"
              >
                <div className="justify-center my-2 input-group">
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="New username"
                    className={`input input-bordered text-base-content
                     ${invalidUsername ? "border-error" : ""} 
                     ${namechangeSuccess ? "border-success" : ""} 
                    `}
                    onChange={(ev) => {
                      const newUsername = ev.target.value;

                      if (newUsername.length >= 2 && newUsername.length <= 16) {
                        setUsername(newUsername);
                        setInvalidUsername(false);
                      } else {
                        setInvalidUsername(true);
                      }
                    }}
                  />
                  <button
                    className={`btn btn-primary 
                    ${invalidUsername ? "btn-error" : ""}
                    ${namechangeSuccess ? "btn-success" : ""} 
                    `}
                    onClick={changeUsername}
                  >
                    Change
                  </button>
                </div>
              </div>
              <div className="flex justify-center gap-8 my-2">
                <Link to="/game" className="btn btn-primary">
                  Create a Game
                </Link>
                <Link to="/browser" className="btn btn-primary">
                  Search a Game
                </Link>
              </div>
            </div>

            {/* <button className="btn btn-primary">Get Started</button> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
