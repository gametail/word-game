import { words } from "./words/words_de";

export function getRandomWord(): string {
  return words[Math.floor(Math.random() * words.length)];
}

export function IsInList(word: string): boolean {
  return words.includes(word);
}
