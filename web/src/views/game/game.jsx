import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export function Game() {
  const { gameId } = useParams();
  const [question, setQuestion] = useState(null);
  const [opponentChoice, setOpponentChoice] = useState(null);
  const [score, setScore] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    setWs(socket);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", gameId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        setOpponentChoice(data.choice);
      } else if (data.type === "score") {
        setScore(data.score);
      }
    };

    return () => {
      socket.close();
    };
  }, [gameId]);

  useEffect(() => {
    fetchQuestion();
  }, []);

  const fetchQuestion = async () => {
    const response = await fetch("http://localhost:3000/question");
    const data = await response.json();
    setQuestion(data);
    setOpponentChoice(null);
  };

  const submitAnswer = async (choice) => {
    await fetch("http://localhost:3000/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, choice }),
    });

    if (ws) {
      ws.send(JSON.stringify({ type: "answer", gameId, choice }));
    }

    fetchQuestion();
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div className='text-center'>
      <h2 className='mb-4'>Category: {question.category}</h2>
      <div className='row'>
        <div className='col-6'>
          <button
            className='btn btn-lg btn-outline-primary w-100'
            onClick={() => submitAnswer(question.option1)}
          >
            {question.option1}
          </button>
        </div>
        <div className='col-6'>
          <button
            className='btn btn-lg btn-outline-primary w-100'
            onClick={() => submitAnswer(question.option2)}
          >
            {question.option2}
          </button>
        </div>
      </div>
      {opponentChoice && (
        <div className='mt-4'>
          <h3>Opponent chose: {opponentChoice}</h3>
        </div>
      )}
      {score !== null && (
        <div className='mt-4'>
          <h2>Final Score: {score}</h2>
        </div>
      )}
      <div className='mt-4'>
        <p>Share this link with your friend:</p>
        <input
          type='text'
          className='form-control'
          value={`${window.location.origin}/game/${gameId}`}
          readOnly
        />
      </div>
    </div>
  );
}
