import { FC, useState } from "react";
import { RiPantoneFill, RiArrowDropDownLine } from "react-icons/ri";
import { Theme, themes, useThemeStore } from "../../hooks/useThemeStore";

interface IThemeChanger {}

const ThemeChanger: FC<IThemeChanger> = ({}) => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="m-1 btn">
        <RiPantoneFill size={25} className="mr-1" />
        Theme
        <RiArrowDropDownLine size={25} className="ml-1" />
      </label>
      <div
        tabIndex={0}
        className="dropdown-content bg-base-200 text-base-content rounded-box top-px h-[90vh] max-h-[820px] w-56 overflow-y-auto shadow mt-16"
      >
        <div className="grid grid-cols-1 gap-3 p-3">
          {themes.map((t, i) => (
            <button
              className="overflow-hidden text-left rounded-lg outline-base-content"
              key={i}
              onClick={() => setTheme(t)}
            >
              <div
                data-theme={t}
                className="w-full font-sans cursor-pointer bg-base-100 text-base-content"
              >
                <div className="grid grid-cols-5 grid-rows-3">
                  <div className="flex items-center col-span-5 row-span-3 row-start-1 gap-2 px-4 py-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`${
                        t === theme ? "" : "invisible"
                      } w-3 h-3 shrink-0`}
                    >
                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"></path>
                    </svg>
                    <div className="flex-grow text-sm">{t}</div>
                    <div className="flex flex-wrap flex-shrink-0 h-full gap-1">
                      <div className="w-2 rounded bg-primary"></div>
                      <div className="w-2 rounded bg-secondary"></div>
                      <div className="w-2 rounded bg-accent"></div>
                      <div className="w-2 rounded bg-neutral"></div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeChanger;
