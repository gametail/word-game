import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/index.css";
import SocketContextComponent from "./context/Socket/Component";
import { BrowserRouter } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketContextComponent>
        <App />
      </SocketContextComponent>
    </BrowserRouter>
  </React.StrictMode>
);
