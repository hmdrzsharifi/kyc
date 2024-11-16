// controllers/kycController.js
const User = require('../models/User');

exports.uploadDocuments = async (req, res) => {
    const files = req.files.map(file => file.path);
    await User.findByIdAndUpdate(req.user.userId, { documents: files, kycStatus: 'pending' });
    res.json({ message: 'Documents uploaded, KYC status set to pending' });
};

exports.verifyKYC = async (req, res) => {
    const { userId, status } = req.body;
    if (!['verified', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid status' });

    await User.findByIdAndUpdate(userId, { kycStatus: status });
    res.json({ message: `KYC status updated to ${status}` });
};
