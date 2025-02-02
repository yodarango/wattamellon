import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./views/home/home";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
