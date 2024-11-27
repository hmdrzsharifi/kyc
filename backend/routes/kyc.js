const express = require('express');
const router = express.Router();
const multer = require('multer');

const KycDocument = require('../models/KycDocument');
const User = require('../models/User');

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // حداکثر حجم فایل: 5MB
}).fields([
    { name: 'document_1', maxCount: 1 },
    { name: 'document_2', maxCount: 1 },
    { name: 'document_3', maxCount: 1 },
    { name: 'document_4', maxCount: 1 },
]);

const videoStorage = multer.diskStorage({
    destination: './uploads/videos/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const videoUpload = multer({ storage: videoStorage });


// Upload KYC Documents
/**
 * @swagger
 * /api/kyc/upload-documents:
 *   post:
 *     summary: Upload KYC Documents
 *     description: Upload KYC documents along with the user's details.
 *     security:
 *       - OAuth2: [admin, user]
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document_type:
 *                 type: string
 *               document_number:
 *                 type: string
 *               expiration_date:
 *                 type: string
 *                 format: date
 *               issued_country:
 *                 type: string
 *               gender:
 *                 type: string
 *               address:
 *                 type: object
 *                 additionalProperties: true
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documents uploaded successfully
 *       500:
 *         description: Failed to upload documents
 */
router.post('/upload-documents',  upload , async (req, res) => {
    const { document_type, document_number, expiration_date, issued_country, gender, address , user_email} = req.body;
    const fs = require('fs');
    const path = require('path');

    const user = await User.findOne({ email: user_email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const document_images = Object.keys(req.files).map((key) => {
        const originalPath = req.files[key][0].path;
        const directory = path.dirname(originalPath);
        const originalFileName = path.basename(originalPath);
        const newFileName = `${user._id}_${originalFileName}`;
        const newPath = path.join(directory, newFileName);

        fs.renameSync(originalPath, newPath);

        return {
            type: key,
            url: newPath,
        };
    });

    const kycDocument = new KycDocument({
        user_id: user._id,
        document_type,
        document_number,
        expiration_date,
        issued_country,
        document_images,
        gender,
        video: { url: null, type: null, uploaded_at: null },
        address: address || {}  // اضافه کردن آدرس به مستندات
    });

    try {
        await kycDocument.save();
        await User.findByIdAndUpdate(user._id, { kyc_status: 'documents_uploaded', kyc_updated_at: new Date() });
        res.json({ message: 'Documents uploaded' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to upload documents' });
    }
});


/**
 * @swagger
 * /api/kyc/status:
 *   post:
 *     summary: Get KYC Status
 *     description: Retrieve the KYC status of the user based on the user ID provided in the request body.
 *     security:
 *       - OAuth2: [admin, user]
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_email:
 *                 type: string
 *                 description: The unique identifier of the user
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: The KYC status of the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 kyc_status:
 *                   type: string
 *                   example: "documents_uploaded"
 *       400:
 *         description: User ID is required in the request body
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to get KYC status
 */
router.post('/status', async (req, res) => {
    const { user_email } = req.body;

    if (!user_email) {
        return res.status(400).json({ error: 'User ID is required in the request body' });
    }

    try {
        const user = await User.findOne({ email: user_email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ kyc_status: user.kyc_status });
    } catch (err) {
        console.error('Error retrieving user KYC status:', err);
        res.status(500).json({ error: 'Failed to get KYC status' });
    }
});

// Get KYC Status
// /**
//  * @swagger
//  * /api/kyc/status:
//  *   get:
//  *     summary: Get KYC Status
//  *     description: Retrieve the KYC status of the user.
//  *     security:
//  *       - OAuth2: [admin, user]
//  *     tags:
//  *       - KYC
//  *     responses:
//  *       200:
//  *         description: The KYC status of the user
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 kyc_status:
//  *                   type: string
//  *                   example: "documents_uploaded"
//  *       500:
//  *         description: Failed to get KYC status
//  */
// router.get('/status', async (req, res) => {
//     const userId = req.user.userId;
//     try {
//         const user = await User.findById(userId);
//         res.json({ kyc_status: user.kyc_status });
//     } catch (err) {
//         res.status(500).json({ error: 'Failed to get KYC status' });
//     }
// });



// Upload Video to KYC Document
/**
 * @swagger
 * /api/kyc/upload-video:
 *   post:
 *     summary: Upload Video to KYC Document
 *     description: Upload a video to the KYC document for verification.
 *     security:
 *       - OAuth2: [admin, user]
 *     tags:
 *       - KYC
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document_id:
 *                 type: string
 *               video:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 *       404:
 *         description: Document not found for the user
 *       500:
 *         description: Failed to upload video
 */
router.post('/upload-video', videoUpload.single('video'), async (req, res) => {
    const { document_id , user_email} = req.body;

    try {
        const user = await User.findOne({ email: user_email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // پیدا کردن داکیومنت مرتبط با کاربر و ID
        const kycDocument = await KycDocument.findOne({ user_id: user._id }).sort({ uploaded_at: -1 });

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
