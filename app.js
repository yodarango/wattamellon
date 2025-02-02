const { pool } = require("./db.js");
const express = require("express");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const path = require("path");

const db = pool;
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:8007", "http://wattamellon_web:8007"],
    // credentials: true,
  })
);

// Servire i file statici dalla cartella "public"
app.use(express.static(path.join(__dirname, "web")));

// Route per servire il file index.html
app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "web", "index.html"));
});

const JWT_SECRET = "your-secret-key";

// Helper function to generate random questions
async function generateRandomQuestions(gameId, numQuestions = 10) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Get all options grouped by category
    const [options] = await connection.query(
      "SELECT id, category_id FROM options"
    );

    // Group options by category
    const optionsByCategory = options.reduce((acc, opt) => {
      if (!acc[opt.category_id]) acc[opt.category_id] = [];
      acc[opt.category_id].push(opt.id);
      return acc;
    }, {});

    // Generate questions
    for (let i = 0; i < numQuestions; i++) {
      // Pick a random category
      const categoryId =
        Object.keys(optionsByCategory)[
          Math.floor(Math.random() * Object.keys(optionsByCategory).length)
        ];
      const categoryOptions = optionsByCategory[categoryId];

      // Pick two random different options from the same category
      const option1Index = Math.floor(Math.random() * categoryOptions.length);
      let option2Index;
      do {
        option2Index = Math.floor(Math.random() * categoryOptions.length);
      } while (option1Index === option2Index);

      // Insert question
      await connection.query(
        "INSERT INTO game_questions (game_id, option1_id, option2_id) VALUES (?, ?, ?)",
        [gameId, categoryOptions[option1Index], categoryOptions[option2Index]]
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Create a new game
app.post("/api/games", async (req, res) => {
  console.log("------ Creating a new game");
  try {
    const gameId = uuidv4();
    await db.query("INSERT INTO games (id) VALUES (?)", [gameId]);
    await generateRandomQuestions(gameId);

    // Create JWT for game creator
    const token = jwt.sign({ gameId, isCreator: true }, JWT_SECRET);

    res.json({ gameId, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to create game" });
  }
});

// Join a game
app.post("/api/games/:gameId/join", async (req, res) => {
  try {
    const { gameId } = req.params;

    // Check if game exists
    const [game] = await db.query("SELECT id FROM games WHERE id = ?", [
      gameId,
    ]);
    if (!game.length) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Create JWT for player
    const token = jwt.sign({ gameId, isCreator: false }, JWT_SECRET);

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to join game" });
  }
});

// Get game questions
app.get("/api/games/:gameId/questions", async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.gameId !== gameId) {
      return res.status(403).json({ error: "Invalid token for this game" });
    }

    const [questions] = await db.query(
      `
      SELECT gq.id, o1.value as option1, o2.value as option2
      FROM game_questions gq
      JOIN options o1 ON gq.option1_id = o1.id
      JOIN options o2 ON gq.option2_id = o2.id
      WHERE gq.game_id = ?
    `,
      [gameId]
    );

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: "Failed to get questions" });
  }
});

// Submit answer
app.post(
  "/api/games/:gameId/questions/:questionId/answer",
  async (req, res) => {
    try {
      const { gameId, questionId } = req.params;
      const { selectedOptionId } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ error: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.gameId !== gameId) {
        return res.status(403).json({ error: "Invalid token for this game" });
      }

      // Get the creator's answer for this question
      const [creatorAnswer] = await db.query(
        `
      SELECT selected_option_id
      FROM game_answers
      WHERE game_id = ? AND question_id = ? AND player_token IN (
        SELECT token FROM game_players WHERE is_creator = 1
      )
    `,
        [gameId, questionId]
      );

      const isCorrect =
        creatorAnswer.length > 0 &&
        creatorAnswer[0].selected_option_id === selectedOptionId;

      // Save the answer
      await db.query(
        `
      INSERT INTO game_answers 
      (game_id, question_id, selected_option_id, player_token, is_correct)
      VALUES (?, ?, ?, ?, ?)
    `,
        [gameId, questionId, selectedOptionId, token, isCorrect]
      );

      res.json({ isCorrect });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit answer" });
    }
  }
);

// Get game results
app.get("/api/games/:gameId/results", async (req, res) => {
  try {
    const { gameId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.gameId !== gameId) {
      return res.status(403).json({ error: "Invalid token for this game" });
    }

    // Get all players' scores
    const [results] = await db.query(
      `
      SELECT 
        player_token,
        COUNT(CASE WHEN is_correct = 1 THEN 1 END) as correct_answers,
        COUNT(*) as total_answers
      FROM game_answers
      WHERE game_id = ?
      GROUP BY player_token
    `,
      [gameId]
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Failed to get results" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
