// models/document.js
const mongoose = require("mongoose");
const documentSchema = new mongoose.Schema({
    userKYCId: { type: mongoose.Schema.Types.ObjectId, required: true },
    documentType: { type: String, enum: ['passport', 'drivers_license', 'national_id', 'bill'], required: true },
    fileId: { type: mongoose.Schema.Types.String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    verifiedStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: String, default: null },
    reasonForRejection: { type: String, default: null },
    base64File:{type:String , default:null},
    metadata: { type: Object, default: {} },
});

module.exports = mongoose.model('Document', documentSchema , 'Document_kyc');
