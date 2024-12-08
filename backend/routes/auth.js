const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const crypt = require('unix-crypt-td-js');

const User = require('../models/User');
const UserEntity = require("../models/UserEntityModel");

// Register
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: The first name of the user
 *                 example: "John"
 *               lastname:
 *                 type: string
 *                 description: The last name of the user
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 description: The email address of the user
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: The password for the user account
 *                 example: "securepassword123"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered"
 *       400:
 *         description: User already exists or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.post('/register', async (req, res) => {
    const {email , userName, password , firstName , lastName} = req.body;

    await UserEntity.sync();
    const hashedPassword = hashPassword(password);
    // ایجاد کاربر جدید
    // const newUser = await UserEntity.create({
    //     apps: 'KYCApp',
    //     email: email,
    //     firstname: ' ',
    //     lastname: ' ',
    //     password: hashedPassword1,
    //     username: userName,
    // });
    const newUser = await UserEntity.create({
        email_verified: true, // مقدار پیش‌فرض، در صورت نیاز تغییر دهید
        createdtimestamp: Date.now(), // زمان ایجاد به صورت timestamp
        email: email,
        firstname: firstName,
        lastname: lastName,
        password_hash: hashedPassword, // نام ستون اصلاح شد
        username: userName,
    });

    // Validate input...
    const user = new User({ email, password: hashedPassword });
    try {
        await user.save();

        console.log('User saved:', newUser.toJSON());
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


const hashPassword = (password) => {
    // استفاده از الگوریتم SHA-256 برای هش کردن پسورد
    const hash = crypto.createHash('sha256');
    hash.update(password); // پسورد را به هش اضافه می‌کنیم
    return hash.digest('hex'); // تبدیل هش به رشته هگزادسیمال
};

module.exports = router;
