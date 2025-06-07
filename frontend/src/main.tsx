import { HeroUIProvider, ToastProvider } from "@heroui/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HeroUIProvider>
      <ToastProvider />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HeroUIProvider>
  </React.StrictMode>
);