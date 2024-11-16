// routes/kycRoutes.js
const express = require('express');
const { uploadDocuments, verifyKYC } = require('../controllers/kycController');
const authenticate = require('../middleware/authenticate');
const multer = require('multer');
const router = express.Router();
const path = require('path');

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure files are stored in the 'uploads' directory
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Ensure files have unique names by appending the timestamp
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.post('/upload', authenticate, upload.array('documents'), uploadDocuments);
router.post('/verify', authenticate, verifyKYC);

module.exports = router;
