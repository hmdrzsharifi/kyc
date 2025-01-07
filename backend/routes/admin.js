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


router.get('/pending-level2', async (req, res) => {
    try {
        // گرفتن اطلاعات KYC با وضعیت 'pendingForLevel2'
        const pendingLevel2KYCs = await UserKYC.find({ status: 'pendingForLevel2' });

        const result = [];

        for (const kyc of pendingLevel2KYCs) {
            const kycData = { ...kyc._doc };

            // گرفتن سند هویتی مرتبط
            const idDocument = await Document.findOne({ _id: kyc.documents?.idDocumentId });

            if (idDocument) {
                const identityFilePath = path.join(uploadDir, idDocument.fileId);
                if (fs.existsSync(identityFilePath)) {
                    const identityFileData = fs.readFileSync(identityFilePath);
                    idDocument.base64File = identityFileData.toString('base64');
                }
            }

            kycData.documents = { idDocument };

            // گرفتن اطلاعات کاربر از پایگاه داده PostgreSQL
            if (kyc.userId) {
                try {
                    const user = await UserEntity.findOne({ where: { id: kyc.userId }, raw: true });
                    if (user) {
                        const { password, ...userWithoutPassword } = user;
                        kycData.user = userWithoutPassword;
                    }
                } catch (error) {
                    console.error("Error fetching user: ", error);
                }
            }

            result.push(kycData);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/pending-level3', async (req, res) => {
    try {
        // گرفتن اطلاعات KYC با وضعیت 'pendingForLevel3'
        const pendingLevel3KYCs = await UserKYC.find({ status: 'pendingForLevel3' });

        const result = [];

        for (const kyc of pendingLevel3KYCs) {
            const kycData = { ...kyc._doc };

            // گرفتن آدرس مرتبط
            const address = await Address.findOne({ _id: kyc.addressId });
            kycData.address = address;

            // گرفتن billDocument مرتبط
            const billDocument = await Document.findOne({ _id: kyc.documents?.billDocumentId });

            if (billDocument) {
                const billFilePath = path.join(uploadDir, billDocument.fileId);
                if (fs.existsSync(billFilePath)) {
                    const billFileData = fs.readFileSync(billFilePath);
                    billDocument.base64File = billFileData.toString('base64');
                }
            }

            kycData.documents = { billDocument };

            // گرفتن اطلاعات کاربر از پایگاه داده PostgreSQL
            if (kyc.userId) {
                try {
                    const user = await UserEntity.findOne({ where: { id: kyc.userId }, raw: true });
                    if (user) {
                        const { password, ...userWithoutPassword } = user;
                        kycData.user = userWithoutPassword;
                    }
                } catch (error) {
                    console.error("Error fetching user: ", error);
                }
            }

            result.push(kycData);
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/verify-documents/level2', async (req, res) => {
    const { userId, documentUpdates } = req.body;

    if (!userId || !Array.isArray(documentUpdates)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        // دریافت UserKYC مرتبط با کاربر
        const userKYC = await UserKYC.findOne({
            userId,
            status: { $in: ['pendingForLevel2', 'rejectedLevel2'] }
        }).populate('documents.idDocumentId');

        if (!userKYC) {
            return res.status(404).json({ message: 'UserKYC not found or not in pendingForLevel2' });
        }

        // به‌روزرسانی وضعیت اسناد (idDocument)
        for (const { documentId, verifiedStatus, reasonForRejection } of documentUpdates) {
            const document = await Document.findById(documentId);
            if (!document) {
                return res.status(404).json({ message: `Document with ID ${documentId} not found` });
            }
            const documentInUserKYC =
                userKYC.documents.idDocumentId?._id.toString() === documentId ||
                userKYC.documents.billDocumentId?._id.toString() === documentId;

            if (!documentInUserKYC) {
                return res.status(400).json({ message: `Document with ID ${documentId} is not associated with this user KYC` });
            }

            document.verifiedStatus = verifiedStatus;
            document.reasonForRejection = reasonForRejection || null;
            document.verifiedAt = verifiedStatus === 'verified' ? new Date() : null;
            document.verifiedBy = req.adminId || 'admin'; // شناسه ادمین
            await document.save();
        }

        if (documentUpdates[0].verifiedStatus === 'verified') {
            userKYC.status = 'verifiedLevel2';
            userKYC.verificationLevel = 2;

            // به‌روزرسانی وضعیت کاربر
            await UserEntity.update({ level: 2 }, { where: { id: userId } });
        } else {
            userKYC.status = 'rejectedLevel2';
        }

        userKYC.updatedAt = new Date();
        await userKYC.save();

        res.status(200).json({ message: 'Level 2 verification completed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});



router.post('/verify-documents/level3', async (req, res) => {
    const { userId, documentUpdates, addressUpdate } = req.body;

    if (!userId || !Array.isArray(documentUpdates) || !addressUpdate) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        // دریافت UserKYC مرتبط با کاربر
        const userKYC = await UserKYC.findOne({ userId, status: { $in: ['pendingForLevel3', 'rejectedLevel3'] } })
            .populate('documents.billDocumentId');
        if (!userKYC) {
            return res.status(404).json({ message: 'UserKYC not found or not in pendingForLevel2' });
        }
        const documentInUserKYC =
            userKYC.documents.idDocumentId?._id.toString() === documentId ||
            userKYC.documents.billDocumentId?._id.toString() === documentId;

        if (!documentInUserKYC) {
            return res.status(400).json({ message: `Document with ID ${documentId} is not associated with this user KYC` });
        }

        // به‌روزرسانی وضعیت اسناد (billDocument)
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
        const address = await Address.findOne({ _id: userKYC.addressId });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        address.verified = addressUpdate.verified;
        address.verificationDate = addressUpdate.verified ? new Date() : null;
        await address.save();

        // بررسی تأیید اسناد و آدرس
        const billDocumentVerified = userKYC.documents.billDocumentId?.verifiedStatus === 'verified';
        const addressVerified = address.verified === true;

        if (documentUpdates[0].verifiedStatus === 'verified' && addressUpdate.verified) {
            userKYC.status = 'verifiedLevel3';
            userKYC.verificationLevel = 3;

            // به‌روزرسانی وضعیت کاربر
            await UserEntity.update({ level: 3 }, { where: { id: userId } });
        } else {
            userKYC.status = 'rejectedLevel3';
        }

        userKYC.updatedAt = new Date();
        await userKYC.save();

        res.status(200).json({ message: 'Level 3 verification completed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.get('/getUserLevel', async (req, res) => {
    const { userId } = req.body;

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

module.exports = router;



router.get('/pending-kycs', async (req, res) => {
    try {
        // گرفتن اطلاعات KYC با وضعیت 'pendingForLevel2' یا 'pendingForLevel3'
        const pendingKYCs = await UserKYC.find({
            status: { $in: ['pendingForLevel2', 'pendingForLevel3'] }
        });

        const pendingKYCsWithUser = [];

        for (const kyc of pendingKYCs) {
            // کپی داده‌های اصلی KYC به _doc
            const kycData = { ...kyc._doc };

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

            pendingKYCsWithUser.push(kyc);
        }

        // ارسال داده‌ها به کلاینت
        res.status(200).json(pendingKYCsWithUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/rejected-kycs', async (req, res) => {
    try {
        // گرفتن اطلاعات KYC با وضعیت 'pendingForLevel2' یا 'pendingForLevel3'
        const pendingKYCs = await UserKYC.find({
            status: { $in: ['rejectedLevel2' , 'rejectedLevel3'] }
        });

        const pendingKYCsWithUser = [];

        for (const kyc of pendingKYCs) {
            // کپی داده‌های اصلی KYC به _doc
            const kycData = { ...kyc._doc };

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

            pendingKYCsWithUser.push(kyc);
        }

        // ارسال داده‌ها به کلاینت
        res.status(200).json(pendingKYCsWithUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/getUserKyc', async (req, res) => {
    try {
        // گرفتن userId از ورودی (query parameter)
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }

        // گرفتن اطلاعات KYC برای کاربر مشخص
        const userKYCs = await UserKYC.find({ userId });

        if (!userKYCs.length) {
            return res.status(404).json({ message: 'No KYC records found for the specified user.' });
        }

        const userKYCsWithDetails = [];

        for (const kyc of userKYCs) {
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
            try {
                const user = await UserEntity.findOne({ where: { id: kyc.userId }, raw: true });
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    kycData.user = userWithoutPassword;
                }
            } catch (error) {
                console.error("Error fetching user: ", error);
            }

            // اضافه کردن داده‌های پردازش‌شده به نتیجه نهایی
            kyc._doc = kycData;
            userKYCsWithDetails.push(kyc);
        }

        // ارسال نتیجه نهایی
        res.status(200).json(userKYCsWithDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// router.post('/verify-documents', async (req, res) => {
//     const { userId, documentUpdates, addressUpdate } = req.body;
//
//     if (!userId || !Array.isArray(documentUpdates) || !addressUpdate) {
//         return res.status(400).json({ message: 'Invalid input' });
//     }
//
//     try {
//         // دریافت UserKYC مرتبط با کاربر
//         const userKYC = await UserKYC.findOne({ userId }).populate('documents.billDocumentId').populate('documents.idDocumentId');
//         if (!userKYC) {
//             return res.status(404).json({ message: 'UserKYC not found' });
//         }
//
//         // به‌روزرسانی وضعیت اسناد
//         for (const { documentId, verifiedStatus, reasonForRejection } of documentUpdates) {
//             const document = await Document.findById(documentId);
//             if (!document) {
//                 return res.status(404).json({ message: `Document with ID ${documentId} not found` });
//             }
//
//             document.verifiedStatus = verifiedStatus;
//             document.reasonForRejection = reasonForRejection || null;
//             document.verifiedAt = verifiedStatus === 'verified' ? new Date() : null;
//             document.verifiedBy = req.adminId || 'admin'; // شناسه ادمین
//             await document.save();
//         }
//
//         // به‌روزرسانی وضعیت آدرس
//         const address = await Address.findOne({ userKYCId: userKYC._id });
//         if (!address) {
//             return res.status(404).json({ message: 'Address not found' });
//         }
//         address.verified = addressUpdate.verified;
//         address.verificationDate = addressUpdate.verified ? new Date(addressUpdate.verificationDate) : null;
//         await address.save();
//
//         // بررسی تأیید همه موارد
//         const billDocumentVerified = userKYC.documents.billDocumentId?.verifiedStatus === 'verified';
//         const idDocumentVerified = userKYC.documents.idDocumentId?.verifiedStatus === 'verified';
//         const addressVerified = address.verified === true;
//
//         const user = await UserEntity.findOne({ where: { id: userKYC.userId }, raw: true });
//
//         if (billDocumentVerified && idDocumentVerified && addressVerified) {
//             userKYC.status = 'verified'; // تغییر وضعیت به approved
//             userKYC.verificationLevel = 2; // تغییر سطح تایید به 2
//             if (user) {
//                 // تغییر verificationLevel کاربر به 2
//                 await UserEntity.update(
//                     { level: 2 },
//                     { where: { id: user.id } }
//                 );
//             }
//         }
//
//         userKYC.updatedAt = new Date();
//         await userKYC.save();
//
//         res.status(200).json({ message: 'Documents and address updated successfully'});
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Internal server error', error });
//     }
// });




module.exports = router;