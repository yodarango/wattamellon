export const CreateNew = () => {
  const handleCreateGame = async () => {
    try {
      const response = await fetch(`/api/games`, {
        method: "POST",
      });

      console.log("------", response);
      const data = await response.json();
      setGameId(data.gameId);
      localStorage.setItem("gameToken", data.token);
      fetchQuestions(data.gameId);
      setGameState("play");
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };
  return (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-2xl font-bold text-center mb-6'>Create New Game</h2>
        <button
          onClick={handleCreateGame}
          className='w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors'
        >
          Start New Game
        </button>
      </div>
    </div>
  );
};
