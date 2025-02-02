export const Game = () => {
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
  return (
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
};
