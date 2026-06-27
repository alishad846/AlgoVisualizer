require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY || 'algo_vision_secret_key';

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Initialize PostgreSQL Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        // Create Users Table
        client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `, (err, result) => {
            release();
            if (err) {
                console.error('Error creating users table', err.stack);
            }
        });
    }
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email';
        
        const result = await pool.query(sql, [email, hashedPassword]);
        const user = result.rows[0];
        
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        if (error.code === '23505') { // PostgreSQL unique constraint violation code
            return res.status(400).json({ error: 'User already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(sql, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '24h' });
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
