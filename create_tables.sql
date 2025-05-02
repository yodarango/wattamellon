-- Create tables for wattamellon app
USE wattamellon;

-- Drop tables if they exist
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS games;

-- Create games table
CREATE TABLE games (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50),
  player_name VARCHAR(50),
  size INT,
  creator_token VARCHAR(50),
  questions TEXT,
  thumbnail VARCHAR(100),
  is_complete BOOLEAN DEFAULT FALSE,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_sessions table
CREATE TABLE game_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id INT,
  player_token VARCHAR(50),
  answers TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  success_rate TINYINT DEFAULT 101,
  player_name VARCHAR(50),
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint (optional)
ALTER TABLE game_sessions
ADD CONSTRAINT fk_game_id
FOREIGN KEY (game_id) REFERENCES games(id)
ON DELETE CASCADE;
