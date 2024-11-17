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

const videoStorage = multer.diskStorage({
    destination: './uploads/videos/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const videoUpload = multer({ storage: videoStorage });


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
        document_images ,
        video: { url: null, type: null, uploaded_at: null }
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



// Upload Video to KYC Document
router.post('/upload-video', authenticateToken, videoUpload.single('video'), async (req, res) => {
    const userId = req.user.userId;
    const { document_id } = req.body;

    try {
        // پیدا کردن داکیومنت مرتبط با کاربر و ID
        const kycDocument = await KycDocument.findOne({ user_id: userId });

        if (!kycDocument) {
            return res.status(404).json({ error: 'Document not found for this user' });
        }

        // ذخیره آدرس ویدیو در داکیومنت
        kycDocument.video = {
            type: req.file.mimetype,
            url: req.file.path,
            uploaded_at: new Date()
        };

        await kycDocument.save();
        res.json({ message: 'Video uploaded successfully', document: kycDocument });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

module.exports = router;
