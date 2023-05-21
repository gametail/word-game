import { Link, Outlet, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Game from "./pages/Game";
import NavBar from "./components/NavBar";
import GameBrowser from "./pages/GameBrowser";

function App() {
  return (
    <div className="flex flex-col h-screen">
      <NavBar>
        <Link to="/" className="text-2xl font-extrabold select-none ">
          WORDL ROYALE
        </Link>
        <Link to="/game">Game</Link>
        <Link to="/browser">Browser</Link>
        <Link to="/history">History</Link>
      </NavBar>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />}>
          {/* <Route path="/game/:gid" element={<Game />} /> */}
        </Route>

        <Route path="/browser" element={<GameBrowser />} />
      </Routes>
    </div>
  );
}

export default App;
