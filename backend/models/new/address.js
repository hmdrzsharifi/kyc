// models/address.js
const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
    userKYCId: { type: mongoose.Schema.Types.ObjectId, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    verified: { type: Boolean, default: false },
    verificationDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Address', addressSchema);
