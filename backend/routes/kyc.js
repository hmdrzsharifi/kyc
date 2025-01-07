const express = require('express');
const router = express.Router();
const multer = require('multer');

const UserKYC = require('../models/new/userKYC');
const Address = require('../models/new/address');
const Document = require('../models/new/document');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const UserEntity = require('../models/new/UserEntityModel');


const uploadDir = 'uploads-new/';

// Check if the directory exists, and create it if it doesn't
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // مسیر ذخیره فایل‌ها
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage });

router.post('/level2', upload.single('identity'), async (req, res) => {
    let identityFile;
    try {
        const tokenParsed = req.kauth.grant.access_token.content;
        const userId = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;

        // بررسی وجود فایل
        if (!req.file) {
            return res.status(400).json({ message: 'Identity document is required' });
        }

        identityFile = req.file;

        // بررسی نوع سند هویت
        const allowedIdentityTypes = ['passport', 'drivers_license', 'national_id'];
        const { identityType } = req.body;

        if (!allowedIdentityTypes.includes(identityType)) {
            return res.status(400).json({ message: `Invalid identityType. Allowed values: ${allowedIdentityTypes.join(', ')}` });
        }

        // ایجاد یا پیدا کردن UserKYC برای کاربر
        let userKYC = await UserKYC.findOne({ userId });
        if (!userKYC) {
            userKYC = new UserKYC({
                userId,
                verificationLevel: 1,
                status: 'pendingForLevel2',
                documents: {}
            });
            await userKYC.save();
        }

        // آپلود فایل در مدل Document
        const identityDocument = new Document({
            userKYCId: userKYC._id,
            documentType: identityType,
            fileId: identityFile.filename,
            fileName: identityFile.originalname,
            fileType: identityFile.mimetype,
            metadata: { uploadedBy: userId }
        });
        await identityDocument.save();

        // به‌روزرسانی UserKYC با سند
        userKYC.documents.idDocumentId = identityDocument._id;
        userKYC.updatedAt = new Date();
        await userKYC.save();

        res.status(201).json({
            message: 'Identity document uploaded successfully',
            userKYC,
            document: identityDocument
        });
    } catch (error) {
        // پاک‌سازی فایل آپلود شده در صورت بروز خطا
        if (identityFile) {
            const identityFilePath = path.join(uploadDir, identityFile.filename);
            if (fs.existsSync(identityFilePath)) {
                fs.unlinkSync(identityFilePath);
            }
        }
        res.status(500).json({ message: error.message });
    }
});


router.post('/level3', upload.fields([
    { name: 'bill', maxCount: 1 }
]), async (req, res) => {
    let billFile;
    try {
        const tokenParsed = req.kauth.grant.access_token.content;
        const userId = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;
        let userKYC = await UserKYC.findOne({ userId });
        if (userKYC.verificationLevel < 2){
            return res.status(500).json({ message: 'user cannot to request for level 3' });
        }

        // بررسی وجود فایل
        if (!req.files || !req.files.bill) {
            return res.status(400).json({ message: 'Bill document is required' });
        }

        billFile = req.files.bill[0];

        // بررسی اطلاعات آدرس
        const { addressLine1, addressLine2, city, state, postalCode, country } = req.body;
        if (!addressLine1 || !city || !state || !postalCode || !country) {
            return res.status(400).json({ message: 'All address fields are required (addressLine1, city, state, postalCode, country).' });
        }

        let address;
        if (userKYC.addressId) {
            address = await Address.findById(userKYC.addressId);
            address.addressLine1 = addressLine1;
            address.addressLine2 = addressLine2;
            address.city = city;
            address.state = state;
            address.postalCode = postalCode;
            address.country = country;
            address.updatedAt = new Date();
        } else {
            address = new Address({
                userKYCId: userKYC._id,
                addressLine1,
                city,
                state,
                postalCode,
                country
            });
            await address.save();
            userKYC.addressId = address._id;
        }
        await address.save();

        // آپلود فایل bill در مدل Document
        const billDocument = new Document({
            userKYCId: userKYC._id,
            documentType: 'bill',
            fileId: billFile.filename,
            fileName: billFile.originalname,
            fileType: billFile.mimetype,
            metadata: { uploadedBy: userId }
        });
        await billDocument.save();

        // به‌روزرسانی UserKYC با سند bill
        userKYC.documents.billDocumentId = billDocument._id;
        userKYC.updatedAt = new Date();
        userKYC.status = 'pendingForLevel3';
        await userKYC.save();

        res.status(201).json({
            message: 'Address and bill uploaded successfully',
            userKYC,
            documents: { billDocument },
            address
        });
    } catch (error) {
        // پاک‌سازی فایل آپلود شده در صورت بروز خطا
        if (billFile) {
            const billFilePath = path.join(uploadDir, billFile.filename);
            if (fs.existsSync(billFilePath)) {
                fs.unlinkSync(billFilePath);
            }
        }
        res.status(500).json({ message: error.message });
    }
});



router.get('/getUserLevel', async (req, res) => {
    const tokenParsed = req.kauth.grant.access_token.content;
    const userId = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;
    // const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
    }

    try {
        // جستجوی اطلاعات کاربر بر اساس userId
        const user = await UserEntity.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ارسال سطح کاربر در پاسخ
        res.status(200).json({ level: user.level });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


// router.post('/upload-documents', upload.fields([
//     { name: 'bill', maxCount: 1 },
//     { name: 'identity', maxCount: 1 }
// ]), async (req, res) => {
//     let billFile, identityFile;
//     try {
//         const tokenParsed = req.kauth.grant.access_token.content;
//         const userId = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;
//
//         // بررسی وجود فایل‌ها
//         if (!req.files || !req.files.bill || !req.files.identity) {
//             return res.status(400).json({ message: 'Both bill and identity documents are required' });
//         }
//
//         billFile = req.files.bill[0];
//         identityFile = req.files.identity[0];
//
//         // بررسی نوع سند هویت
//         const allowedIdentityTypes = ['passport', 'drivers_license', 'national_id'];
//         const { identityType, addressLine1, addressLine2, city, state, postalCode, country } = req.body;
//
//         if (!allowedIdentityTypes.includes(identityType)) {
//             return res.status(400).json({ message: `Invalid identityType. Allowed values: ${allowedIdentityTypes.join(', ')}` });
//         }
//
//         // بررسی اطلاعات آدرس
//         if (!addressLine1 || !city || !state || !postalCode || !country) {
//             return res.status(400).json({ message: 'All address fields are required (addressLine1, city, state, postalCode, country).' });
//         }
//
//         // ایجاد یا پیدا کردن UserKYC برای کاربر
//         let userKYC = await UserKYC.findOne({ userId });
//         if (!userKYC) {
//             userKYC = new UserKYC({
//                 userId,
//                 verificationLevel: 1,
//                 status: 'pending',
//                 documents: {}
//             });
//         }
//
//         // ایجاد یا به‌روزرسانی آدرس
//         let address;
//         if (userKYC.addressId) {
//             address = await Address.findById(userKYC.addressId);
//             address.addressLine1 = addressLine1;
//             address.addressLine2 = addressLine2;
//             address.city = city;
//             address.state = state;
//             address.postalCode = postalCode;
//             address.country = country;
//             address.updatedAt = new Date();
//         } else {
//             address = new Address({
//                 userKYCId: userKYC._id,
//                 addressLine1,
//                 city,
//                 state,
//                 postalCode,
//                 country
//             });
//             await address.save();
//             userKYC.addressId = address._id;
//         }
//         await address.save();
//
//         // آپلود فایل‌ها در مدل Document
//         const billDocument = new Document({
//             userKYCId: userKYC._id,
//             documentType: 'bill',
//             fileId: billFile.filename,
//             fileName: billFile.originalname,
//             fileType: billFile.mimetype,
//             metadata: { uploadedBy: userId }
//         });
//         await billDocument.save();
//
//         const identityDocument = new Document({
//             userKYCId: userKYC._id,
//             documentType: identityType,
//             fileId: identityFile.filename,
//             fileName: identityFile.originalname,
//             fileType: identityFile.mimetype,
//             metadata: { uploadedBy: userId }
//         });
//         await identityDocument.save();
//
//         // به‌روزرسانی UserKYC با اسناد
//         userKYC.documents.billDocumentId = billDocument._id;
//         userKYC.documents.idDocumentId = identityDocument._id;
//         userKYC.updatedAt = new Date();
//         await userKYC.save();
//
//         res.status(201).json({
//             message: 'Documents and address uploaded successfully',
//             userKYC,
//             documents: { billDocument, identityDocument },
//             address
//         });
//     } catch (error) {
//         // Cleanup uploaded files if there's an error
//         if (billFile) {
//             const billFilePath = path.join(uploadDir, billFile.filename);
//             if (fs.existsSync(billFilePath)) {
//                 fs.unlinkSync(billFilePath);  // Delete the bill file
//             }
//         }
//         if (identityFile) {
//             const identityFilePath = path.join(uploadDir, identityFile.filename);
//             if (fs.existsSync(identityFilePath)) {
//                 fs.unlinkSync(identityFilePath);  // Delete the identity file
//             }
//         }
//         res.status(500).json({ message: error.message });
//     }
// });







module.exports = router;
