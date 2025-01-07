const mongoose = require('mongoose');

const userKYC = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.String, required: true },
    verificationLevel: { type: Number, enum: [1,2,3], default: 1 },
    status: { type: String, enum: ['pendingForLevel2', 'pendingForLevel3' , 'verifiedLevel2', 'verifiedLevel3' ,  'rejectedLevel2' , 'rejectedLevel3'], default: 'pending' },
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    documents: {
        billDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
        idDocumentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserKYC', userKYC , 'User_kyc');
