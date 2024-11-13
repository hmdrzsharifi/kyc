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
