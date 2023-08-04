import { create } from "zustand";

interface GameState {
  matchLetters: string;
  misplaceLetters: string;
  mismatchLetters: string;
  addMatchLetter: (letter: string) => void;
  addMisplaceLetter: (letter: string) => void;
  addMismatchLetter: (letter: string) => void;
  resetMatchLetters: () => void;
  resetMisplaceLetters: () => void;
  resetMismatchLetters: () => void;
}

export const useGameStore = create<GameState>()((set) => ({
  matchLetters: "",
  misplaceLetters: "",
  mismatchLetters: "",
  addMatchLetter: (letter) =>
    set((state) => {
      if (!state.matchLetters.includes(letter)) {
        return { matchLetters: state.matchLetters + letter };
      }
      return state;
    }),
  addMisplaceLetter: (letter) =>
    set((state) => {
      if (!state.misplaceLetters.includes(letter)) {
        return { misplaceLetters: state.misplaceLetters + letter };
      }
      return state;
    }),
  addMismatchLetter: (letter) =>
    set((state) => {
      if (!state.mismatchLetters.includes(letter)) {
        return { mismatchLetters: state.mismatchLetters + letter };
      }
      return state;
    }),
  resetMatchLetters: () => set(() => ({ matchLetters: "" })),
  resetMisplaceLetters: () => set(() => ({ misplaceLetters: "" })),
  resetMismatchLetters: () => set(() => ({ mismatchLetters: "" })),
}));

// const connection = window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
//   name: "Game state",
// });

// connection?.init(useGameStore.getState());

// useGameStore.subscribe((newState) => {
//   connection?.send("State", newState);
// });
