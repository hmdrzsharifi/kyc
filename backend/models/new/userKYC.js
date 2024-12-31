const mongoose = require('mongoose');

const userKYC = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.String, required: true },
    verificationLevel: { type: Number, enum: [1, 2], default: 1 },
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    documents: {
        billDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        idDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserKYC', userKYC);
