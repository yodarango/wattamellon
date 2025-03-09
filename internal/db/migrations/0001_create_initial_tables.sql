-- Active: 1738444071464@@127.0.0.1@3306@wattamellon
DROP DATABASE IF EXISTS wattamellon;
CREATE DATABASE IF NOT EXISTS wattamellon;

USE wattamellon;

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

CREATE TABLE game_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id INT,
  player_token VARCHAR(50),
  answers TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  success_rate TINYINT DEFAULT 101,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
