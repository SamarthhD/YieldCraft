const express = require('express');        // Framework to build APIs
const bodyParser = require('body-parser'); // Parses incoming JSON
const cors = require('cors');              // Allows frontend (Angular) to connect
const bcrypt = require('bcrypt');          // For hashing passwords
const jwt = require('jsonwebtoken');       // For generating login tokens
const pool = require('./db');              // PostgreSQL connection
const axios = require('axios');            // HTTP requests
const dotenv = require('dotenv');          // Environment variables
dotenv.config();

// Basic app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Read configuration from .env
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";
const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000/analyze";

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, hashedPassword]
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Email already registered!' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// JWT Verification Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = user;
    next();
  });
}

// Add Investment (secured route)
app.post('/api/investments', authenticateToken, async (req, res) => {
  const { asset_name, asset_type, units, purchase_price, current_price } = req.body;
  const userId = req.user.id;

  try {
    const insertQuery = `
      INSERT INTO investments (user_id, asset_name, asset_type, units, purchase_price, current_price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [
      userId, asset_name, asset_type, units, purchase_price, current_price
    ]);

    const allInvestments = await pool.query(
      "SELECT * FROM investments WHERE user_id = $1",
      [userId]
    );

    // Call FastAPI for analytics
    const response = await axios.post(FASTAPI_URL, {
      user_id: userId,
      investments: allInvestments.rows
    });

    res.json({
      message: "Investment added successfully",
      investment: rows[0],
      analytics: response.data
    });
  } catch (error) {
    console.error("Error adding investment:", error.message);
    res.status(500).json({ error: "Failed to add investment" });
  }
});

// Fetch All Investments
app.get('/api/investments', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ investments: result.rows });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
