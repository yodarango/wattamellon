-- Active: 1738444071464@@127.0.0.1@3307@wattamellon
CREATE DATABASE IF NOT EXISTS wattamellon;
USE wattamellon;

CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  value VARCHAR(100) NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE games (
  id VARCHAR(36) PRIMARY KEY,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id VARCHAR(36),
  option1_id INT,
  option2_id INT,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (option1_id) REFERENCES options(id),
  FOREIGN KEY (option2_id) REFERENCES options(id)
);

CREATE TABLE game_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id VARCHAR(36),
  question_id INT,
  selected_option_id INT,
  player_token VARCHAR(100),
  is_correct BOOLEAN,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (question_id) REFERENCES game_questions(id),
  FOREIGN KEY (selected_option_id) REFERENCES options(id)
);