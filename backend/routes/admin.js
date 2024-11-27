const express = require('express');
const router = express.Router();

const KycDocument = require('../models/KycDocument');
const User = require('../models/User');

// Get Users Awaiting Verification
/**
 * @swagger
 * /api/admin/kyc-pending:
 *   get:
 *     summary: Fetch all users with uploaded documents
 *     tags: [KYC]
 *     responses:
 *       200:
 *         description: List of users with uploaded documents
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   kyc_status:
 *                     type: string
 *       500:
 *         description: Server error
 */

router.get('/kyc-pending', async (req, res) => {
    try {
        const users = await User.find({ kyc_status: 'documents_uploaded' });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});


/**
 * @swagger
 * /api/admin/kyc-documents:
 *   post:
 *     summary: Fetch KYC documents for a user
 *     tags: [KYC]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: "60d21b4667d0d8992e610c85"
 *     responses:
 *       200:
 *         description: Document and associated images and video
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 document:
 *                   type: object
 *                   description: Document details
 *                 documentImages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       base64:
 *                         type: string
 *       404:
 *         description: Document not found for the user
 *       500:
 *         description: Server error
 */
router.post('/kyc-documents', async (req, res) => {
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

        const documentVideo = document.video && document.video.url? (() => {
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
/**
 * @swagger
 * /api/admin/verify/{userId}:
 *   post:
 *     summary: Verify or reject a user's KYC documents
 *     tags: [KYC]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to verify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 description: Action to take, either 'approve' or 'reject'
 *                 example: "approve"
 *               rejection_reason:
 *                 type: string
 *                 description: Reason for rejection if the action is 'reject'
 *                 example: "Insufficient documentation"
 *     responses:
 *       200:
 *         description: User KYC status updated
 *       400:
 *         description: Invalid action
 *       500:
 *         description: Server error
 */
router.post('/verify/:userId', async (req, res) => {
    const { userId } = req.params; // دریافت userId از پارامترهای مسیر
    const { action, rejection_reason , admin_email } = req.body; // action: approve یا reject

    try {
        // بررسی action برای تایید یا رد کاربر
        if (action === 'approve') {
            // بروزرسانی وضعیت کاربر به approved
            await User.findByIdAndUpdate(userId, {
                kyc_status: 'approved',
                kyc_level: 2,
                kyc_updated_at: new Date()
            });

            // بروزرسانی اسناد KYC مرتبط با کاربر
            await KycDocument.updateMany({ user_id: userId }, {
                verification_status: 'verified',
                reviewed_by: admin_email, // شناسه‌ی کاربر بررسی‌کننده
                reviewed_at: new Date()
            });

            return res.json({ message: 'User approved' });
        }

        if (action === 'reject') {
            // بروزرسانی وضعیت کاربر به rejected
            await User.findByIdAndUpdate(userId, {
                kyc_status: 'rejected',
                kyc_updated_at: new Date()
            });

            // بروزرسانی اسناد KYC مرتبط با وضعیت رد شده
            await KycDocument.updateMany({ user_id: userId }, {
                verification_status: 'rejected',
                reviewed_by: admin_email, // شناسه‌ی کاربر بررسی‌کننده
                reviewed_at: new Date(),
                rejection_reason // دلیل رد شدن
            });

            return res.json({ message: 'User rejected' });
        }

        // اگر action نامعتبر باشد
        return res.status(400).json({ error: 'Invalid action' });

    } catch (err) {
        console.error('Error verifying user:', err);
        return res.status(500).json({ error: 'Failed to update user status' });
    }
});


module.exports = router;
