import { create } from "zustand";

export const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
] as const;

export type Theme = (typeof themes)[number];

interface IThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<IThemeStore>()((set) => ({
  theme: (localStorage.getItem("theme") as Theme) || "light",
  setTheme: (theme) =>
    set(() => {
      localStorage.setItem("theme", theme);
      return { theme };
    }),
}));
