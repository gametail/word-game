import { Link, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import GameTab from "./pages/GameTab";
import NavBar from "./components/NavBar";
import GameBrowser from "./pages/GameBrowser";
import { useThemeStore } from "./hooks/useThemeStore";

function App() {
  const { theme } = useThemeStore();

  return (
    <div className="flex flex-col h-screen " data-theme={theme}>
      <NavBar>
        <Link to="/" className="text-2xl font-extrabold select-none ">
          WORD BATTLE
        </Link>
        <Link to="/game">Game</Link>
        <Link to="/browser">Browser</Link>
        <Link to="/history">History</Link>
      </NavBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GameTab />}>
          {/* <Route path="/game/:gid" element={<Game />} /> */}
        </Route>

        <Route path="/browser" element={<GameBrowser />} />
      </Routes>
    </div>
  );
}

export default App;
