const express = require('express');
const router = express.Router();

const UserKYC = require('../models/new/userKYC');
const Address = require('../models/new/address');
const Document = require('../models/new/document');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const UserEntity = require('../models/new/UserEntityModel');

const uploadDir = 'uploads-new/';


router.get('/pending-kycs', async (req, res) => {
    try {
        // گرفتن اطلاعات KYC با وضعیت 'pending'
        const pendingKYCs = await UserKYC.find({ status: 'pending' });

        const pendingKYCsWithFilesAndUser = [];

        for (const kyc of pendingKYCs) {
            // کپی داده‌های اصلی KYC به _doc
            const kycData = { ...kyc._doc };

            // گرفتن آدرس مرتبط
            const address = await Address.findOne({ _id: kyc.addressId });
            kycData.address = address;

            // گرفتن مدارک مرتبط
            const billDocument = await Document.findOne({ _id: kyc.documents?.billDocumentId });
            const idDocument = await Document.findOne({ _id: kyc.documents?.idDocumentId });

            if (billDocument) {
                const billFilePath = path.join(uploadDir, billDocument.fileId);
                if (fs.existsSync(billFilePath)) {
                    const billFileData = fs.readFileSync(billFilePath);
                    billDocument.base64File = billFileData.toString('base64');
                }
            }

            if (idDocument) {
                const identityFilePath = path.join(uploadDir, idDocument.fileId);
                if (fs.existsSync(identityFilePath)) {
                    const identityFileData = fs.readFileSync(identityFilePath);
                    idDocument.base64File = identityFileData.toString('base64');
                }
            }

            kycData.documents = { billDocument, idDocument };

            // گرفتن اطلاعات کاربر از پایگاه داده PostgreSQL
            if (kyc.userId) {
                try {
                    const user = await UserEntity.findOne({ where: { id: kyc.userId }, raw: true });
                    if (user) {
                        const { password, ...userWithoutPassword } = user;
                        kycData.user = userWithoutPassword; //
                    }
                } catch (error) {
                    console.error("Error fetching user: ", error);
                }
            }

            // اضافه کردن داده‌های پردازش‌شده به فیلد _doc
            kyc._doc = kycData;

            pendingKYCsWithFilesAndUser.push(kyc);
        }

        // ارسال داده‌ها به کلاینت
        res.status(200).json(pendingKYCsWithFilesAndUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/verify-documents', async (req, res) => {
    const { userId, documentUpdates, addressUpdate } = req.body;

    if (!userId || !Array.isArray(documentUpdates) || !addressUpdate) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        // دریافت UserKYC مرتبط با کاربر
        const userKYC = await UserKYC.findOne({ userId }).populate('documents.billDocumentId').populate('documents.idDocumentId');
        if (!userKYC) {
            return res.status(404).json({ message: 'UserKYC not found' });
        }

        // به‌روزرسانی وضعیت اسناد
        for (const { documentId, verifiedStatus, reasonForRejection } of documentUpdates) {
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ message: `Document with ID ${documentId} not found` });
            }

            document.verifiedStatus = verifiedStatus;
            document.reasonForRejection = reasonForRejection || null;
            document.verifiedAt = verifiedStatus === 'verified' ? new Date() : null;
            document.verifiedBy = req.adminId || 'admin'; // شناسه ادمین
            await document.save();
        }

        // به‌روزرسانی وضعیت آدرس
        const address = await Address.findOne({ userKYCId: userKYC._id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        address.verified = addressUpdate.verified;
        address.verificationDate = addressUpdate.verified ? new Date(addressUpdate.verificationDate) : null;
        await address.save();

        // بررسی تأیید همه موارد
        const billDocumentVerified = userKYC.documents.billDocumentId?.verifiedStatus === 'verified';
        const idDocumentVerified = userKYC.documents.idDocumentId?.verifiedStatus === 'verified';
        const addressVerified = address.verified === true;

        const user = await UserEntity.findOne({ where: { id: userKYC.userId }, raw: true });

        if (billDocumentVerified && idDocumentVerified && addressVerified) {
            userKYC.status = 'verified'; // تغییر وضعیت به approved
            userKYC.verificationLevel = 2; // تغییر سطح تایید به 2
            if (user) {
                // تغییر verificationLevel کاربر به 2
                await UserEntity.update(
                    { level: 2 },
                    { where: { id: user.id } }
                );
            }
        }

        userKYC.updatedAt = new Date();
        await userKYC.save();

        res.status(200).json({ message: 'Documents and address updated successfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});




module.exports = router;