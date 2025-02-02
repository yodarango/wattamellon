import React from "react";

export const Start = () => (
  <div className='d-flex align-center justify-center gap-4'>
    <button onClick={() => setGameState("create")} className='card'>
      Create New Game
    </button>
    <button onClick={() => setGameState("create")} className='card'>
      Join Game
    </button>
  </div>
);
