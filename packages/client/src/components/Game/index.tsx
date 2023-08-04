import { useContext, useEffect, useRef, useState } from "react";
import SocketContext, {
  IHistoryObject,
  TFeedback,
} from "../../context/Socket/context";
import Countdown from "../Countdown";
import StatTracker from "../StatTracker";
import {
  RiCheckboxCircleFill,
  RiDeleteBack2Fill,
  RiInputMethodLine,
  RiUserSearchFill,
} from "react-icons/ri";
import { useGameStore } from "../../hooks/useGameStore";

interface IGame {}
interface IGuessHistory {
  history: IHistoryObject[];
  name?: string;
  self?: boolean;
}

const GuessHistory: React.FC<IGuessHistory> = ({ history, name, self }) => {
  const guessHistoryEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    window.requestAnimationFrame(() =>
      guessHistoryEndRef.current?.scrollIntoView({ behavior: "smooth" })
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  useEffect(() => {}, [history]);

  return (
    <div
      className={`relative bg-primary min-w-fit max-h-fit ${
        self ? "rounded-2xl" : "rounded-xl "
      } overflow-y-auto`}
    >
      {!self && (
        <h2 className="absolute inset-x-0 top-0 font-bold text-center transition-opacity duration-150 place-self-start rounded-xl text-primary-content hover:opacity-20">
          {name}
        </h2>
      )}
      <div
        className={`flex flex-col ${
          self ? "p-2 min-w-[528px] h-[528px]" : "p-1 min-w-[144px] h-[144px]"
        }`}
      >
        {history.map(({ word, result }, index) => (
          <Guess
            className={index === 0 ? "mt-auto" : self ? " mt-2" : "mt-1"}
            key={index}
            word={word}
            result={result}
          />
        ))}
        <div
          ref={guessHistoryEndRef}
          className={history.length > 5 ? "pb-2 " : ""}
        />
      </div>
    </div>
  );
};
interface IGuess {
  className?: string;
  result: TFeedback[];
  word?: string;
}
const Guess: React.FC<IGuess> = ({ className, word, result }) => {
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
    <div className={`${className} flex ${word ? " gap-2" : " gap-1"}`}>
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
  const { socket } = useContext(SocketContext).SocketState;
  const [inputs, setInputs] = useState<string[]>(["", "", "", "", ""]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // const [matchLetters, setMatchLetters] = useState<string>("");
  // const [misplaceLetters, setMisplaceLetters] = useState<string>("");
  // const [mismatchLetters, setMismatchLetters] = useState<string>("");
  const {
    matchLetters,
    misplaceLetters,
    mismatchLetters,
    addMatchLetter,
    addMisplaceLetter,
    addMismatchLetter,
    resetMatchLetters,
    resetMisplaceLetters,
    resetMismatchLetters,
  } = useGameStore();

  const inputRefs = useRef<Array<HTMLInputElement>>([]);
  const [playInvalidAnim, setPlayInvalidAnim] = useState<boolean>(false);

  useEffect(() => {
    if (inputRefs.current[currentIndex]) {
      inputRefs.current[currentIndex].focus();
    }

    if (!socket) return;

    socket.on("reset_round", () => {
      setInputs(["", "", "", "", ""]);
      setCurrentIndex(0);
      resetMatchLetters();
      resetMisplaceLetters();
      resetMismatchLetters();
    });

    socket.on(
      "guess_result",
      ({
        evaluation,
        guess,
        result,
      }: {
        evaluation: TGuessResult;
        guess?: string;
        result?: TFeedback[];
      }) => {
        if (evaluation === "invalid") {
          setPlayInvalidAnim(true);
          return;
        }

        if (result == undefined || guess == undefined) return;

        result.forEach((r, i) => {
          const letter = guess[i];

          if (r === "match" && !matchLetters.includes(letter)) {
            // setMatchLetters((letters) => {
            //   if (!letters.includes(letter)) {
            //     return letters + letter;
            //   }
            //   return letters;
            // });
            addMatchLetter(letter);
          }
          if (r === "misplace" && !misplaceLetters.includes(letter)) {
            // setMisplaceLetters((letters) => {
            //   if (!letters.includes(letter)) {
            //     return letters + letter;
            //   }
            //   return letters;
            // });
            addMisplaceLetter(letter);
          }
          if (r === "mismatch" && !mismatchLetters.includes(letter)) {
            // setMismatchLetters((letters) => {
            //   if (!letters.includes(letter)) {
            //     return letters + letter;
            //   }
            //   return letters;
            // });
            addMismatchLetter(letter);
          }
        });

        //TODO Clear input
        setInputs(["", "", "", "", ""]);
        setCurrentIndex(0);
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
    } else if (key === "ArrowRight" && currentIndex < 4) {
      setCurrentIndex(currentIndex + 1);
    } else if (key === "ArrowLeft" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
    if (guess) {
      socket?.emit("check_guess", guess);
    } else {
      setPlayInvalidAnim(true);
    }
  };

  return (
    <div>
      <div
        onAnimationEnd={() => setPlayInvalidAnim(false)}
        className={`flex gap-4 p-2 mt-2  ${
          playInvalidAnim && " animate-shake animate-duration-200 animate-twice"
        }`}
      >
        {inputs.map((input, index) => (
          <input
            className={`w-24 h-24 text-6xl font-extrabold text-center capitalize rounded-2xl input input-bordered input-primary transition-colors ${
              playInvalidAnim && " border-error focus:outline-error"
            }`}
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

      <Keyboard
        keyRows={[
          ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
          ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
          ["Y", "X", "C", "V", "B", "N", "M"],
        ]}
        defaultInputFunction={handleInput}
        keysEval={{
          match: matchLetters,
          mismatch: mismatchLetters,
          misplace: misplaceLetters,
        }}
        backspaceFn={handleBackspace}
        submitFn={handleSubmit}
      />
    </div>
  );
};

interface IKeyboard {
  keyRows: string[][];
  defaultInputFunction: (value: string) => void;
  keysEval: { match: string; mismatch: string; misplace: string };
  backspaceFn: () => void;
  submitFn: () => void;
}
export const Keyboard: React.FC<IKeyboard> = ({
  keyRows,
  defaultInputFunction,
  keysEval,
  backspaceFn,
  submitFn,
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
                className={`btn text-xl font-bold ${
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
      <div className="flex gap-2 ">
        <div className="w-32 h-12 btn btn-primary" onClick={backspaceFn}>
          <RiDeleteBack2Fill className="text-2xl " />
        </div>
        <div className="w-32 h-12 btn btn-primary" onClick={submitFn}>
          <RiCheckboxCircleFill className="text-2xl" />
        </div>
      </div>
    </div>
  );
};

type TGuessResult = "correct" | "incorrect" | "invalid";
const Game: React.FC<IGame> = () => {
  const { lobbies, gid, socket } = useContext(SocketContext).SocketState;
  const lobby = lobbies[gid];
  const { players, selfIndex, currentRound, gameSettings } = lobby;
  const [numGuessingPlayers, setNumGuessingPlayers] = useState(
    players.reduce((acc, curr) => (curr.state === "guessing" ? ++acc : acc), 0)
  );

  function updateNumGuessingPlayers() {
    setNumGuessingPlayers(
      players.reduce(
        (acc, curr) => (curr.state === "guessing" ? ++acc : acc),
        0
      )
    );
  }

  const [showDisplay, setShowDisplay] = useState(false);
  const [win, setWin] = useState(false);
  const [correctWord, setCorrectWord] = useState("");

  useEffect(() => {
    updateNumGuessingPlayers();
    if (players[selfIndex].guesses === 0) {
      setShowDisplay(true);
    }
  }, [players[selfIndex].guesses]);

  useEffect(() => {
    if (!socket) return;
    socket.on("reset_round", () => {
      setShowDisplay(false);
      setWin(false);
      setCorrectWord("");
    });

    socket.on(
      "guess_result",
      ({
        evaluation,
        guess,
      }: {
        evaluation: TGuessResult;
        guess?: string;
        result?: TFeedback[];
      }) => {
        if (evaluation === "correct") {
          setWin(true);

          if (guess) {
            setCorrectWord(guess);
          }

          setShowDisplay(true);

          return;
        }
      }
    );
  }, []);
  useEffect(() => {
    if (!socket) return;
    socket.on("reset_round", () => {
      setShowDisplay(false);
      setWin(false);
      setCorrectWord("");
    });

    socket.on(
      "guess_result",
      ({
        evaluation,
        guess,
      }: {
        evaluation: TGuessResult;
        guess?: string;
        result?: TFeedback[];
      }) => {
        if (evaluation === "correct") {
          setWin(true);

          if (guess) {
            setCorrectWord(guess);
          }

          setShowDisplay(true);

          return;
        }
      }
    );
  }, []);

  return (
    <div className="flex flex-col h-full">
      {lobby.players.length > 1 && (
        <div className="flex gap-5 p-2 m-2 bg-base-300 rounded-2xl min-h-[160px] w-auto overflow-x-auto overflow-y-hidden">
          {players.map(
            ({ username, guessHistory }, index) =>
              index !== selfIndex && (
                <GuessHistory
                  key={index}
                  history={guessHistory}
                  name={username}
                />
              )
          )}
        </div>
      )}
      <div className="relative flex items-center justify-center h-full gap-16 select-none">
        {showDisplay && (
          // <div className="absolute z-10 flex flex-col items-center justify-center w-full h-full gap-4 backdrop-blur-sm">
          <div className="absolute z-10 flex flex-col items-center justify-center w-full h-full gap-6 text-neutral-content bg-opacity-90 bg-neutral">
            {win ? (
              <div className="flex flex-col items-center gap-6">
                <h1 className="text-6xl font-extrabold">Correct!</h1>
                <div className="flex gap-2">
                  {correctWord.split("").map((letter, index) => (
                    <div
                      className={`flex items-center justify-center w-24 h-24 rounded-2xl text-center bg-success text-success-content font-extrabold text-6xl capitalize select-none border-2 border-primary shadow-lg`}
                      key={index}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <h1 className="text-6xl font-extrabold">No guesses left.</h1>
                <h1 className="text-6xl font-extrabold">Next time champ</h1>
              </div>
            )}

            <h1 className="px-10 text-4xl font-bold uppercase divider before:bg-neutral-content after:bg-neutral-content">{`Wait for ${
              currentRound < gameSettings.rounds
                ? "next round to begin"
                : "game to finish"
            }...`}</h1>
            <h1 className="flex items-center gap-2 text-4xl font-bold">
              Players still guessing <RiUserSearchFill /> {numGuessingPlayers}
            </h1>
            {lobby.roundStart && (
              <Countdown
                big
                roundStart={lobby.roundStart}
                timeSetting={lobby.gameSettings.time}
              />
            )}
          </div>
        )}

        <GuessHistory history={players[selfIndex].guessHistory} self />
        <div className="flex flex-col items-center justify-center h-full ">
          <h1 className="flex flex-col items-center text-2xl font-bold">
            {lobby.roundStart && !showDisplay && (
              <Countdown
                roundStart={lobby.roundStart}
                timeSetting={lobby.gameSettings.time}
              />
            )}
            <StatTracker />
          </h1>

          <GuessForm />
        </div>
      </div>
    </div>
  );
};

export default Game;
