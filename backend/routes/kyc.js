const express = require('express');
const router = express.Router();
const multer = require('multer');

const { authenticateToken } = require('../middleware/authMiddleware');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Upload KYC Documents
router.post('/upload-documents', authenticateToken, upload.array('documents'), async (req, res) => {
    const userId = req.user.userId;
    const { document_type, document_number, expiration_date, issued_country } = req.body;
    const document_images = req.files.map(file => ({
        type: file.fieldname,
        url: file.path
    }));

    const kycDocument = new KycDocument({
        user_id: userId,
        document_type,
        document_number,
        expiration_date,
        issued_country,
        document_images
    });

    try {
        await kycDocument.save();
        await User.findByIdAndUpdate(userId, { kyc_status: 'documents_uploaded', kyc_updated_at: new Date() });
        res.json({ message: 'Documents uploaded' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload documents' });
    }
});

// Get KYC Status
router.get('/status', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User.findById(userId);
        res.json({ kyc_status: user.kyc_status });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get KYC status' });
    }
});

module.exports = router;
