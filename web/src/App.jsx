import { CreateNew } from "./views/CreateNew";
import { useState, useEffect } from "react";
import { Results } from "./views/Results";
import { Start } from "./views/Start";
import { Game } from "./views/Game";

export const App = () => {
  const [gameState, setGameState] = useState("menu");

  // route query
  const route = new URLSearchParams(window.location.search);

  useEffect(() => {
    // Verifica se un game essiste nel local storage
    const game = localStorage.getItem("game");

    if (game) {
      const gameObj = JSON.parse(game || "{}");
      if (gameObj.token) {
        setGameState("play");
        return;
      }
    }
  }, []);

  // ascolta al cambio di query per renderizzare la pagina giusta
  useEffect(() => {
    const view = route.get("view");
    setGameState(view || "start");
  }, [route]);

  return (
    <main className='main-container'>
      {gameState === "start" && <Start />}
      {gameState === "createNew" && <CreateNew />}
      {gameState === "game" && <Game />}
      {gameState === "results" && <Results />}
    </main>
  );
};
