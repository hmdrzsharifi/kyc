// index.js
require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const kycRoutes = require('./routes/kycRoutes');
const cors = require('cors');
  // اجازه می‌دهد که درخواست‌ها از دیگر مراجع (مثل React) پذیرفته شوند


const app = express();
app.use(express.json());
app.use('/uploads', express.static('uploads')); // برای دسترسی به فایل‌های آپلود شده
app.use(cors({
  origin: 'http://localhost:3000', // آدرس کلاینت
  credentials: true // برای ارسال کوکی‌ها اگر نیاز بود
}));
connectDB().then(r => {});

app.use('/auth', authRoutes);
app.use('/kyc', kycRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
