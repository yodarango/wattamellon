import { useState, useEffect } from "react";

const EitherOrGame = () => {
  const [gameState, setGameState] = useState("menu"); // menu, create, play, results
  const [gameId, setGameId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  // const API_URL = "http://localhost:3000";

  // Game creation component
  const CreateGame = () => (
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

  // Game menu component
  const GameMenu = () => (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-lg p-6'>
        <h1 className='text-3xl font-bold text-center mb-8'>Either/Or Game</h1>
        <div className='space-y-4'>
          <button
            onClick={() => setGameState("create")}
            className='w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded hover:bg-blue-600 transition-colors'
          >
            Create New Game
          </button>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-gray-300'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-white text-gray-500'>OR</span>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <input
              type='text'
              placeholder='Enter Game ID'
              className='flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
            <button
              onClick={() => setGameState("play")}
              className='bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors'
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Question display component
  const QuestionDisplay = () => (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6'>
        <div className='mb-6'>
          <div className='flex justify-between items-center mb-4'>
            <span className='text-sm text-gray-500'>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className='text-sm text-gray-500'>Score: {score}</span>
          </div>
          <div className='h-2 bg-gray-200 rounded'>
            <div
              className='h-2 bg-blue-500 rounded'
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <button
            onClick={() => handleAnswer("option1")}
            className='h-48 bg-blue-500 text-white text-xl font-bold rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center p-4 text-center'
          >
            {questions[currentQuestion]?.option1}
          </button>
          <button
            onClick={() => handleAnswer("option2")}
            className='h-48 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center p-4 text-center'
          >
            {questions[currentQuestion]?.option2}
          </button>
        </div>
      </div>
    </div>
  );

  // Results component
  const Results = () => (
    <div className='min-h-screen bg-gray-100 py-8'>
      <div className='max-w-md mx-auto bg-white rounded-lg shadow-lg p-6'>
        <h2 className='text-2xl font-bold text-center mb-6'>Game Results</h2>
        <div className='text-center mb-8'>
          <p className='text-4xl font-bold text-blue-500 mb-2'>
            {score} / {questions.length}
          </p>
          <p className='text-gray-600'>
            You got {score} out of {questions.length} questions correct!
          </p>
        </div>
        <div className='space-y-4'>
          <button
            onClick={() => setGameState("menu")}
            className='w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded hover:bg-blue-600 transition-colors'
          >
            Play Again
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(gameId);
            }}
            className='w-full bg-gray-500 text-white font-semibold py-2 px-4 rounded hover:bg-gray-600 transition-colors'
          >
            Copy Game ID
          </button>
        </div>
      </div>
    </div>
  );

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

  const fetchQuestions = async (id) => {
    try {
      const response = await fetch(`/api/games/${id}/questions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("gameToken")}`,
        },
      });
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const handleAnswer = async (selectedOption) => {
    try {
      const response = await fetch(
        `/api/games/${gameId}/questions/${questions[currentQuestion].id}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("gameToken")}`,
          },
          body: JSON.stringify({
            selectedOptionId:
              questions[currentQuestion][
                selectedOption === "option1" ? "option1_id" : "option2_id"
              ],
          }),
        }
      );
      const data = await response.json();
      if (data.isCorrect) setScore(score + 1);

      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setGameState("results");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {gameState === "menu" && <GameMenu />}
      {gameState === "create" && <CreateGame />}
      {gameState === "play" && <QuestionDisplay />}
      {gameState === "results" && <Results />}
    </div>
  );
};

export default EitherOrGame;
