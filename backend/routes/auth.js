const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    // Validate input...
    const hashedPassword = await argon2.hash(password);
    const user = new User({ email, password: hashedPassword });
    try {
        await user.save();
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(400).json({ error: 'User already exists' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // Validate input...
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await argon2.verify(user.password, password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, role: user.role }, 'SECRET_KEY' ,{ expiresIn: '1h' });
    res.json({ token, role: user.role });
});

module.exports = router;
