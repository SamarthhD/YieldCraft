
const express = require('express');        // Framework to build APIs
const bodyParser = require('body-parser'); // Parses incoming data to  JSON data
const cors = require('cors');              // Allows frontend (Angular) to connect
const bcrypt = require('bcrypt');          // For hashing passwords
const jwt = require('jsonwebtoken');       // For generating login tokens
const pool = require('./db');              // PostgreSQL connection


//  Basic app setup

const app = express();
app.use(cors());                // Allow all origins (safe for local dev)
app.use(bodyParser.json());     // Parse request bodies as JSON

// Secret key used for signing JWT tokens
const JWT_SECRET = "super_secret_key";


//  User Registration

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body; // extract user input
  try {
    //Hash the password before saving(10 rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    //Insert new user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email`,
      [name, email, hashedPassword]
    );

    //Return the created user (without password)
    res.json({ user: result.rows[0] });
  } catch (error) {
  console.error('Registration error details:', error); // 👈 this shows exact DB error
  if (error.code === '23505') {  // unique violation
    res.status(400).json({ error: 'Email already registered!' });
  } else {
    res.status(400).json({ error: error.message });
  }}
});


//  User Login

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    //Check if user exists
    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    //  Generate JWT token valid for 8 hours
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


//  Middleware to verify JWT

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // 'Bearer <token>'
  if (!token) return res.status(401).json({ error: 'Token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = user;
    next(); // move to next route
  });
}


// Add Investment (secured route)

app.post('/api/investments', authenticateToken, async (req, res) => {
  const { asset_name, asset_type, units, purchase_price, current_price } = req.body;
  const userId = req.user.id;

  try {
    //  Insert the investment for the logged-in user
    const result = await pool.query(
      `INSERT INTO investments (user_id, asset_name, asset_type, units, purchase_price, current_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, asset_name, asset_type, units, purchase_price, current_price]
    );

    res.json({ investment: result.rows[0] });
  } catch (error) {
    console.error('Error adding investment:', error);
    res.status(500).json({ error: 'Failed to add investment' });
  }
});


//  Fetch All Investments

app.get('/api/investments', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ investments: result.rows });
  } catch (error) {
    console.error('Error fetching investments:', error);
    res.status(500).json({ error: 'Failed to fetch investments' });
  }
});


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
