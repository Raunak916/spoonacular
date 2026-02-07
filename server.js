const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const app = express();

//middlrware
app.use(cors()); // Allows our frontend to talk to this server
app.use(bodyParser.json()); // Allows us to read JSON data sent from frontend
app.use(express.static("public")); // Serves our HTML files automatically



// // Add this DEBUG BLOCK (Delete this after fixing!)
// console.log("---------------- DEBUGGING ----------------");
// console.log("Host:", process.env.DB_HOST);
// console.log("User:", process.env.DB_USER); // <--- This MUST show the long string (e.g. DA5TFF...root)
// console.log("Pass:", process.env.DB_PASSWORD ? "****" : "MISSING");
// console.log("-------------------------------------------");




//db
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "2141019402",
  database: process.env.DB_NAME || "RecipeSystem",
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: true } : false,
});




db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL Database...");
  }
});

//routes (API)

//save user in db
app.post("/api/user", (req, res) => {
  const { username, diet, allergies } = req.body;
  const sql = "INSERT INTO users (username, diet, allergies) VALUES (?,?,?)";
  db.query(sql, [username, diet, allergies], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({
      message: "Profile Created Successfully",
      userId: result.insertId,
    });
  });
});

//get reviews as per recipe id
app.get("/api/reviews/:recipeId", (req, res) => {
  const sql = "SELECT * FROM reviews WHERE recipe_id = ?";
  db.query(sql, [req.params.recipeId], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

// submit a review (rate and review reqd)
app.post("/api/reviews", (req, res) => {
  const { recipeId, userId, rating, comment } = req.body;
  const sql =
    "INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?,?,?,?)";
  db.query(sql, [recipeId, userId, rating, comment], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({
      message: "Review Submitted Successfully",
      reviewId: result.insertId,
    });
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

/* 


Query type	     What result contains
SELECT	         Array of row objects (your matching rows)
INSERT	         Metadata (insertId, affectedRows, etc.)
UPDATE	         Metadata (affectedRows, changedRows)
DELETE	         Metadata (affectedRows)
*/
