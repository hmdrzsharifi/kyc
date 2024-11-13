const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    document_type: { type: String, required: true },
    document_number: { type: String },
    expiration_date: { type: Date },
    issued_country: { type: String },
    uploaded_at: { type: Date, default: Date.now },
    document_images: [
        {
            type: { type: String },
            url: { type: String }
        }
    ],
    verification_status: { type: String, default: 'pending' }, // pending, under_review, verified, rejected
    reviewed_by: { type: String },
    reviewed_at: { type: Date },
    rejection_reason: { type: String }
});

module.exports = mongoose.model('KycDocument', DocumentSchema);
