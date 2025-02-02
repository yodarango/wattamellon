// config/database.js
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection and log status
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully");
    console.log(
      `Connected to MySQL database: ${pool.pool.config.connectionConfig.database}`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error("Error details:", error.message);
    return false;
  }
};

// Initialize connection test
testConnection();

// Add event listeners for the pool
pool.on("acquire", function (connection) {
  console.log("Connection %d acquired", connection.threadId);
});

pool.on("error", function (err) {
  console.error("Unexpected error on idle connection", err);
});

pool.on("release", function (connection) {
  console.log("Connection %d released", connection.threadId);
});

module.exports = {
  pool,
  testConnection,
};
