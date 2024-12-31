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

router.post('/upload-documents', upload.fields([
    { name: 'bill', maxCount: 1 },
    { name: 'identity', maxCount: 1 }
]), async (req, res) => {
    let billFile, identityFile;
    try {
        const tokenParsed = req.kauth.grant.access_token.content;
        const userId = tokenParsed.sub.includes(':') ? tokenParsed.sub.split(':').pop() : tokenParsed.sub;

        // بررسی وجود فایل‌ها
        if (!req.files || !req.files.bill || !req.files.identity) {
            return res.status(400).json({ message: 'Both bill and identity documents are required' });
        }

        billFile = req.files.bill[0];
        identityFile = req.files.identity[0];

        // بررسی نوع سند هویت
        const allowedIdentityTypes = ['passport', 'drivers_license', 'national_id'];
        const { identityType, addressLine1, addressLine2, city, state, postalCode, country } = req.body;

        if (!allowedIdentityTypes.includes(identityType)) {
            return res.status(400).json({ message: `Invalid identityType. Allowed values: ${allowedIdentityTypes.join(', ')}` });
        }

        // بررسی اطلاعات آدرس
        if (!addressLine1 || !city || !state || !postalCode || !country) {
            return res.status(400).json({ message: 'All address fields are required (addressLine1, city, state, postalCode, country).' });
        }

        // ایجاد یا پیدا کردن UserKYC برای کاربر
        let userKYC = await UserKYC.findOne({ userId });
        if (!userKYC) {
            userKYC = new UserKYC({
                userId,
                verificationLevel: 1,
                status: 'pending',
                documents: {}
            });
        }

        // ایجاد یا به‌روزرسانی آدرس
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

        // آپلود فایل‌ها در مدل Document
        const billDocument = new Document({
            userKYCId: userKYC._id,
            documentType: 'bill',
            fileId: billFile.filename,
            fileName: billFile.originalname,
            fileType: billFile.mimetype,
            metadata: { uploadedBy: userId }
        });
        await billDocument.save();

        const identityDocument = new Document({
            userKYCId: userKYC._id,
            documentType: identityType,
            fileId: identityFile.filename,
            fileName: identityFile.originalname,
            fileType: identityFile.mimetype,
            metadata: { uploadedBy: userId }
        });
        await identityDocument.save();

        // به‌روزرسانی UserKYC با اسناد
        userKYC.documents.billDocumentId = billDocument._id;
        userKYC.documents.idDocumentId = identityDocument._id;
        userKYC.updatedAt = new Date();
        await userKYC.save();

        res.status(201).json({
            message: 'Documents and address uploaded successfully',
            userKYC,
            documents: { billDocument, identityDocument },
            address
        });
    } catch (error) {
        // Cleanup uploaded files if there's an error
        if (billFile) {
            const billFilePath = path.join(uploadDir, billFile.filename);
            if (fs.existsSync(billFilePath)) {
                fs.unlinkSync(billFilePath);  // Delete the bill file
            }
        }
        if (identityFile) {
            const identityFilePath = path.join(uploadDir, identityFile.filename);
            if (fs.existsSync(identityFilePath)) {
                fs.unlinkSync(identityFilePath);  // Delete the identity file
            }
        }
        res.status(500).json({ message: error.message });
    }
});







module.exports = router;
