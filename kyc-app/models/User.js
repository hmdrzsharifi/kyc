// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    documents: [{ type: String }], // مسیر مدارک آپلود شده
});

module.exports = mongoose.model('User', userSchema);
