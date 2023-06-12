import { useContext, useEffect, useRef, useState } from "react";
import SocketContext from "../../context/Socket/context";
import Countdown from "../Countdown";
import StatTracker from "../StatTracker";

interface IGame {}
interface IGuessHistory {
  history: IHistoryObject[];
  name?: string;
  self?: boolean;
}

const GuessHistory: React.FC<IGuessHistory> = ({ history, name, self }) => {
  return (
    <div
      //   className={`flex flex-col bg-base-200 w-fit h-fit ${
      className={`relative flex flex-col justify-end bg-primary w-fit h-fit overflow-y-auto ${
        self
          ? "gap-2 p-2 rounded-2xl min-w-[528px] min-h-[528px] max-h-[528px] "
          : "gap-1 p-1 rounded-xl min-w-[144px] min-h-[144px] max-h-[144px] "
      }`}
    >
      {!self && (
        <h2 className="absolute inset-x-0 top-0 font-bold text-center transition-opacity duration-150 place-self-start rounded-xl text-primary-content bg-gradient-to-b from-black hover:opacity-100 opacity-30">
          {name}
        </h2>
      )}
      {history?.map(({ word, result }, index) => (
        <Guess key={index} word={word} result={result} />
      ))}
    </div>
  );
};
interface IGuess {
  result: TFeedback[];
  word?: string;
}
const Guess: React.FC<IGuess> = ({ word, result }) => {
  const textColors: { [key in TFeedback]: string } = {
    match: "text-success-content",
    mismatch: "text-neutral-content",
    misplace: "text-warning-content",
  };
  const bgColors: { [key in TFeedback]: string } = {
    match: "bg-success",
    mismatch: "bg-neutral",
    misplace: "bg-warning",
  };

  return (
    <div className={`flex  ${word ? " gap-2 " : " gap-1"}`}>
      {result.map((letterResult, index) => (
        <div
          className={`flex items-center justify-center ${
            word ? " w-24 h-24 rounded-2xl" : "w-6 h-6 rounded-md"
          } text-center ${bgColors[letterResult]}  ${
            textColors[letterResult]
          } font-extrabold text-6xl capitalize select-none`}
          key={index}
        >
          {word ? word[index] : ""}
        </div>
      ))}
    </div>
  );
};
const GuessForm = () => {
  const { socket, lobbies, gid } = useContext(SocketContext).SocketState;
  const [inputs, setInputs] = useState<string[]>(["", "", "", "", ""]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [matchLetters, setMatchLetters] = useState<string>("");
  const [misplaceLetters, setMisplaceLetters] = useState<string>("");
  const [mismatchLetters, setMismatchLetters] = useState<string>("");
  const inputRefs = useRef<Array<HTMLInputElement>>([]);
  const { selfIndex } = lobbies[gid];

  useEffect(() => {
    if (inputRefs.current[currentIndex]) {
      inputRefs.current[currentIndex].focus();
    }

    if (!socket) return;
    socket.on("invlalid_guess", () => {
      console.log("invalid guess");
    });
    socket.on(
      "receive_guess",
      ({ playerIndex, historyObject }: IReceiveGuess) => {
        if (playerIndex === selfIndex) {
          historyObject.result.forEach((r, i) => {
            if (!historyObject.word) return;

            const letter = historyObject.word[i];

            if (r === "match" && !matchLetters.includes(letter)) {
              setMatchLetters((letters) => letters + letter);
            }
            if (r === "misplace" && !misplaceLetters.includes(letter)) {
              setMisplaceLetters((letters) => letters + letter);
            }
            if (r === "mismatch" && !mismatchLetters.includes(letter)) {
              setMismatchLetters((letters) => letters + letter);
            }
          });

          //TODO Clear input
          setInputs(["", "", "", "", ""]);
          setCurrentIndex(0);
        }
      }
    );
    // window.addEventListener("keydown", handleKeyDown);

    // return () => {
    //   window.removeEventListener("keydown", handleKeyDown);
    // };
  }, [currentIndex]);

  const handleKeyDown = (event: React.KeyboardEvent | KeyboardEvent) => {
    const { key } = event;

    if (key === "Backspace") {
      event.preventDefault();
      handleBackspace();
    } else if (key.length === 1) {
      event.preventDefault();
      handleInput(key);
    } else if (key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };
  const handleInput = (value: string) => {
    if (/^[a-zA-Z]$/.test(value)) {
      const updatedInputs = [...inputs];
      updatedInputs[currentIndex] = value;
      setInputs(updatedInputs);

      if (currentIndex < inputs.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }
  };

  const handleBackspace = () => {
    const updatedInputs = [...inputs];

    if (updatedInputs[currentIndex] === "") {
      if (currentIndex > 0) {
        updatedInputs[currentIndex - 1] = "";
        setCurrentIndex(currentIndex - 1);
      }
    } else {
      updatedInputs[currentIndex] = "";
    }
    setInputs(updatedInputs);
  };
  const handleSubmit = () => {
    const guess = inputs.join("").toLocaleLowerCase();
    console.log(guess);
    if (guess) {
      socket?.emit("check_guess", guess);
    }
  };

  return (
    <div>
      <div className="flex gap-4 p-2 m-2">
        {inputs.map((input, index) => (
          <input
            className="w-24 h-24 text-6xl font-extrabold text-center capitalize rounded-2xl input input-bordered input-primary"
            type="text"
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref as HTMLInputElement)}
            onKeyDown={handleKeyDown}
            onFocus={() => setCurrentIndex(index)}
            onChange={() => {}}
            value={input}
            maxLength={1}
          />
        ))}
      </div>
      <Keyboard
        keyRows={[
          ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
          ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
          ["Y", "X", "C", "V", "B", "N", "M"],
        ]}
        defaultInputFunction={handleInput}
        specialKeys={[
          { content: "⟵", fn: handleBackspace },
          { content: "✓", fn: handleSubmit },
        ]}
        keysEval={{
          match: matchLetters,
          mismatch: mismatchLetters,
          misplace: misplaceLetters,
        }}
      />
    </div>
  );
};

interface IKeyboard {
  keyRows: string[][];
  defaultInputFunction: (value: string) => void;
  keysEval: { match: string; mismatch: string; misplace: string };
  specialKeys?: { content: string; fn: () => void }[];
}
const Keyboard: React.FC<IKeyboard> = ({
  keyRows,
  specialKeys,
  defaultInputFunction,
  keysEval,
}) => {
  const { match, mismatch, misplace } = keysEval;
  const textColors: { [key in TFeedback]: string } = {
    match: "text-success-content",
    mismatch: "text-neutral-content",
    misplace: "text-warning-content",
  };
  const bgColors: { [key in TFeedback]: string } = {
    match: "bg-success",
    mismatch: "bg-neutral",
    misplace: "bg-warning",
  };

  return (
    <div className="flex flex-col items-center gap-2 ">
      {keyRows.map((row, i) => (
        <div className="flex gap-2 " key={i}>
          {row.map((key, i2) => {
            const lowerCaseKey = key.toLocaleLowerCase();

            const matchCol: string = match.includes(lowerCaseKey)
              ? `${textColors["match"]} ${bgColors["match"]}`
              : "";
            const misplaceCol: string = misplace.includes(lowerCaseKey)
              ? `${textColors["misplace"]} ${bgColors["misplace"]}`
              : "";
            const mismatchCol: string = mismatch.includes(lowerCaseKey)
              ? `${textColors["mismatch"]} ${bgColors["mismatch"]}`
              : "";

            return (
              <button
                key={`${i}${i2}`}
                className={`btn ${
                  !mismatchCol ? "btn-primary" : "btn-disabled"
                } btn-square  ${matchCol || misplaceCol || mismatchCol}
              `}
                onClick={() => defaultInputFunction(key)}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
      {specialKeys && (
        <div className="flex gap-2 ">
          {specialKeys.map(({ content, fn }, index) => (
            <div className="w-32 h-12 btn btn-primary" key={index} onClick={fn}>
              {content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface IReceiveGuess {
  playerIndex: number;
  historyObject: IHistoryObject;
}
type TFeedback = "match" | "misplace" | "mismatch";

interface IHistoryObject {
  result: TFeedback[];
  word?: string;
}
interface IHistoryState {
  [playerIndex: number]: IHistoryObject[];
}
const Game: React.FC<IGame> = () => {
  const { socket, lobbies, gid } = useContext(SocketContext).SocketState;
  const lobby = lobbies[gid];
  const [history, setHistory] = useState<IHistoryState>(
    lobby.players.reduce((obj, _, index) => {
      obj[index] = [];
      return obj;
    }, {} as Record<number, any>)
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "receive_guess",
      ({ playerIndex, historyObject }: IReceiveGuess) => {
        console.log("new guess received");

        const newHistory = { ...history };

        newHistory[playerIndex].push(historyObject);

        setHistory(newHistory);

        console.log(history);

        // setHistory(newHistory);
      }
    );

    socket.on("correct_word", () => {
      //Round win Animation
      console.log("you won the round");
    });
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* <div className="flex gap-5 m-2 bg-green-700"> */}
      {lobby.players.length > 1 && (
        <div className="flex gap-5 p-2 m-2 bg-base-300 rounded-2xl min-h-[160px]">
          {lobby.players.map(
            ({ username }, index) =>
              index !== lobby.selfIndex && (
                <GuessHistory
                  key={index}
                  history={history[index]}
                  name={username}
                />
              )
          )}
        </div>
      )}
      <div className="flex items-center justify-center h-full gap-16">
        <GuessHistory history={history[lobby.selfIndex]} self />
        <div className="flex flex-col items-center justify-center h-full ">
          <h1 className="flex flex-col items-center text-2xl font-bold">
            {lobby.roundStart && (
              <Countdown
                roundStart={lobby.roundStart}
                timeSetting={lobby.gameSettings.time}
              />
            )}
            {/* <div className="flex gap-10 p-2 mt-4">
              <span>Round: {lobby.currentRound}</span>
              <span>Guesses: {lobby.players[lobby.selfIndex].guesses}</span>
              <span>Score: {lobby.players[lobby.selfIndex].score}</span>
            </div> */}
            <StatTracker />
          </h1>
          <GuessForm />
        </div>
      </div>
    </div>
  );
};

export default Game;
