const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kyc_status: { type: String, default: 'pending' }, // pending, documents_uploaded, under_review, approved, rejected
    kyc_level: { type: Number, default: 1 },
    kyc_updated_at: { type: Date, default: Date.now },
    role: { type: String, default: 'user' } // user, admin
});

module.exports = mongoose.model('User', UserSchema);
