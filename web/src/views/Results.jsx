export const Results = () => (
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
