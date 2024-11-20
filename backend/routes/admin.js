const express = require('express');
const router = express.Router();

const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');
const KycDocument = require('../models/KycDocument');
const User = require('../models/User');

// Get Users Awaiting Verification
router.get('/kyc-pending', authenticateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({ kyc_status: 'documents_uploaded' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


router.post('/kyc-documents', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { userId } = req.body;
        const fs = require('fs');
        const path = require('path');

        // پیدا کردن آخرین داکیومنت مربوط به یوزر
        const document = await KycDocument.findOne({ user_id: userId })
            .sort({ uploaded_at: -1 }); // مرتب‌سازی نزولی بر اساس زمان آپلود

        // ارسال نتیجه به کلاینت
        if (!document) {
            return res.status(404).json({ message: 'No documents found for this user' });
        }

        const documentImages = document.document_images.map(img => {
            const imagePath = path.join("E:\\kyc\\kyc\\backend\\" , img.url); // مسیر کامل تصویر
            if (fs.existsSync(imagePath)) { // بررسی وجود فایل قبل از خواندن
                const imageBuffer = fs.readFileSync(imagePath); // خواندن تصویر از سیستم فایل
                const base64Image = imageBuffer.toString('base64');
                return {
                    type: "image/png",
                    base64: base64Image,
                };
            } else {
                return { error: 'Image not found' }; // اگر تصویر پیدا نشد
            }
        });

        const documentVideo = document.video ? (() => {
            const videoPath = path.join("E:\\kyc\\kyc\\backend\\", document.video.url); // مسیر کامل ویدیو
            if (fs.existsSync(videoPath)) { // بررسی وجود فایل قبل از خواندن
                const videoBuffer = fs.readFileSync(videoPath); // خواندن ویدیو از سیستم فایل
                const base64Video = videoBuffer.toString('base64');
                return {
                    type: document.video.type, // نوع ویدیو را از دیتابیس بخوانید
                    base64: base64Video,
                };
            } else {
                return { error: 'Video not found' }; // اگر ویدیو پیدا نشد
            }
        })() : null;

        // ارسال پاسخ به کلاینت
        res.json({ document, documentImages, documentVideo });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});




// Verify Documents
router.post('/verify/:userId', authenticateToken, isAdmin, async (req, res) => {
    const { userId } = req.params;
    const { action, rejection_reason } = req.body; // action: approve or reject

    try {
        if (action === 'approve') {
            await User.findByIdAndUpdate(userId, { kyc_status: 'approved', kyc_level: 2, kyc_updated_at: new Date() });
            await KycDocument.updateMany({ user_id: userId }, { verification_status: 'verified', reviewed_by: req.user.userId, reviewed_at: new Date() });
            res.json({ message: 'User approved' });
        } else if (action === 'reject') {
            await User.findByIdAndUpdate(userId, { kyc_status: 'rejected', kyc_updated_at: new Date() });
            await KycDocument.updateMany({ user_id: userId }, { verification_status: 'rejected', reviewed_by: req.user.userId, reviewed_at: new Date(), rejection_reason });
            res.json({ message: 'User rejected' });
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
});

module.exports = router;
