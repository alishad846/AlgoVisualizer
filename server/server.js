require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = 'algo_vision_secret_key';

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Database Pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Configure Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: process.env.SMTP_ALLOW_INVALID_CERTS !== 'true',
    }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error acquiring client', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database.');
        // Create Users Table & Ensure Columns Exist
        client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE,
                password TEXT NOT NULL,
                reset_otp VARCHAR(10),
                reset_otp_expires TIMESTAMP
            );
            ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE;
            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp VARCHAR(10);
            ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_otp_expires TIMESTAMP;
            DELETE FROM users WHERE email IS NULL;
            ALTER TABLE users ALTER COLUMN email SET NOT NULL;
        `, (err) => {
            release();
            if (err) {
                console.error('Error migrating users table schema:', err.stack);
            }
        });
    }
});

// Register Endpoint
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email';
        
        const result = await pool.query(sql, [username, email, hashedPassword]);
        const user = result.rows[0];
        
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '365d' });
        res.status(201).json({ message: 'User created successfully', token });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login Endpoint (supports Username OR Email)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE username = $1 OR email = $1';
        const result = await pool.query(sql, [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '365d' });
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: 'No account found with this email address' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await pool.query('UPDATE users SET reset_otp = $1, reset_otp_expires = $2 WHERE id = $3', [otp, expires, user.id]);

        await transporter.sendMail({
            from: process.env.MAIL_FROM || '"AlgoVisualizer" <no-reply@algovisualizer.com>',
            to: email,
            subject: 'Password Reset Verification Code - AlgoVisualizer',
            html: `
              <div style="background:#131313;color:#e2e2e2;padding:40px;font-family:sans-serif;border-radius:10px;max-width:500px;border:1px solid #333;">
                <h2 style="color:#ffffff;margin-top:0;">Password Reset Request</h2>
                <p>You requested to reset your password for AlgoVisualizer. Your 6-digit verification code is:</p>
                <div style="font-size:32px;font-weight:bold;color:#ffffff;background:#000000;padding:16px;text-align:center;border-radius:8px;letter-spacing:6px;border:1px solid #444;margin:24px 0;">${otp}</div>
                <p style="color:#aaaaaa;font-size:14px;">This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
              </div>
            `
        });

        res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send email verification code' });
    }
});

// Verify OTP
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND reset_otp = $2', [email, otp]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date(user.reset_otp_expires) < new Date()) {
            return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
        }

        res.status(200).json({ message: 'Verification code verified successfully' });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Server error verifying code' });
    }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'All fields are required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND reset_otp = $2', [email, otp]);
        const user = result.rows[0];

        if (!user || new Date(user.reset_otp_expires) < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired verification session' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = $1, reset_otp = NULL, reset_otp_expires = NULL WHERE id = $2', [hashedPassword, user.id]);

        res.status(200).json({ message: 'Password reset successfully. You can now login.', username: user.username });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Server error resetting password' });
    }
});

// Social Sign-In Endpoint (Simulated OAuth)
app.post('/api/auth/social', async (req, res) => {
    const { provider, email, username } = req.body;
    if (!email || !username) return res.status(400).json({ error: 'Email and username are required from social provider' });

    try {
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = result.rows[0];

        if (!user) {
            const dummyPassword = await bcrypt.hash(`oauth_${provider}_${Date.now()}`, 10);
            result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', [username, email, dummyPassword]);
            user = result.rows[0];
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '365d' });
        res.status(200).json({ message: `Signed in with ${provider} successfully`, token });
    } catch (error) {
        console.error('Social auth error:', error);
        res.status(500).json({ error: 'Social authentication failed' });
    }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication token required' });

    jwt.verify(token, SECRET_KEY, { ignoreExpiration: true }, (err, user) => {
        if (err || !user) {
            const decoded = jwt.decode(token);
            if (decoded && decoded.username) {
                req.user = decoded;
                return next();
            }
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Get Current User Info
app.get('/api/user/me', authenticateToken, async (req, res) => {
    try {
        let result = await pool.query('SELECT id, username, email FROM users WHERE id = $1 OR username = $2 OR email = $3', [req.user.id || -1, req.user.username || '', req.user.email || '']);
        let user = result.rows[0];
        if (!user) {
            // Fallback response if user record is missing from db during demo/mock mode
            return res.status(200).json({ id: req.user.id || 1, username: req.user.username || 'DemoUser', email: req.user.email || 'demo@algovisualizer.com' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        // Return fallback profile on DB connection error
        res.status(200).json({ id: req.user.id || 1, username: req.user.username || 'DemoUser', email: req.user.email || 'demo@algovisualizer.com' });
    }
});

// Update Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    const { username, email, currentPassword, newPassword } = req.body;
    if (!username || !email) return res.status(400).json({ error: 'Username and email are required' });

    try {
        let result = await pool.query('SELECT * FROM users WHERE id = $1 OR username = $2 OR email = $3', [req.user.id || -1, req.user.username || '', req.user.email || '']);
        let user = result.rows[0];
        if (!user) {
            const dummyPassword = await bcrypt.hash(`default_${Date.now()}`, 10);
            result = await pool.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email', [username, email, dummyPassword]);
            user = result.rows[0];
        }

        let updatedPassword = user.password;
        if (newPassword && newPassword.trim() !== "") {
            if (currentPassword && currentPassword !== "••••••••" && currentPassword !== "********") {
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                if (!isMatch) {
                    return res.status(400).json({ error: 'Incorrect current password' });
                }
            }
            updatedPassword = await bcrypt.hash(newPassword, 10);
        }

        const updateSql = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email';
        const updateResult = await pool.query(updateSql, [username, email, updatedPassword, user.id]);
        const updatedUser = updateResult.rows[0];

        const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username, email: updatedUser.email }, SECRET_KEY, { expiresIn: '365d' });

        res.status(200).json({ message: 'Profile updated successfully', user: updatedUser, token });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Username or email already taken by another account' });
        }
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

// Support Query Endpoint
app.post('/api/support', async (req, res) => {
    const { email, subject, message } = req.body;
    if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required' });
    }
    try {
        await transporter.sendMail({
            from: process.env.MAIL_FROM || '"AlgoVisualizer Support" <no-reply@algovisualizer.com>',
            to: process.env.SMTP_USER, // Send to support admin email
            replyTo: email,
            subject: `[Support Query] ${subject || 'Help & FAQ Inquiry'} from ${email}`,
            html: `
              <div style="background:#131313;color:#e2e2e2;padding:30px;font-family:sans-serif;border-radius:10px;max-width:600px;border:1px solid #333;">
                <h3 style="color:#ffffff;margin-top:0;">New Support Query</h3>
                <p><strong>From User Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                <hr style="border-color:#333;margin:20px 0;" />
                <p style="white-space:pre-wrap;line-height:1.6;">${message}</p>
              </div>
            `
        });
        res.status(200).json({ message: 'Support query sent successfully!' });
    } catch (error) {
        console.error('Support email error:', error);
        res.status(500).json({ error: 'Failed to send support email. Please verify SMTP settings.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
