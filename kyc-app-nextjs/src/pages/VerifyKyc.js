import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Container, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Button, Box, Alert } from '@mui/material';
import Layout from '../Layout';

const VerifyKYC = () => {
    const router = useRouter();
    const { userId } = router.query; // Getting the userId from the URL
    const [action, setAction] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState(null);

    // UseEffect to wait for userId to be available
    useEffect(() => {
        if (!userId) {
            setError('User ID is missing');
        }
    }, [userId]);

    const handleVerify = async () => {
        if (!action) {
            setError('Please select an action');
            return;
        }

        if (!userId) {
            setError('User ID is missing');
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                `http://172.31.13.30:5000/api/admin/verify/${userId}`,
                {
                    action,
                    rejection_reason: action === 'reject' ? rejectionReason : undefined,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.message === 'User approved') {
                setStatus(response.data.message);
            } else {
                setError(response.data.message);
            }
            setTimeout(() => router.push('/admin/kyc-pending'), 2000);
        } catch (err) {
            setError('Failed to verify user');
            console.error(err);
        }
    };

    return (
        <Layout>
            <Container maxWidth="sm">
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h4" gutterBottom>Verify KYC</Typography>

                    {error && <Alert severity="error">{error}</Alert>}
                    {status && <Alert severity="success">{status}</Alert>}

                    <FormControl component="fieldset" sx={{ mb: 3 }}>
                        <FormLabel component="legend">Select Action</FormLabel>
                        <RadioGroup
                            row
                            value={action}
                            onChange={(e) => setAction(e.target.value)}
                        >
                            <FormControlLabel value="approve" control={<Radio />} label="Approve" />
                            <FormControlLabel value="reject" control={<Radio />} label="Reject" />
                        </RadioGroup>
                    </FormControl>

                    {action === 'reject' && (
                        <TextField
                            label="Rejection Reason"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleVerify}
                    >
                        Submit
                    </Button>
                </Box>
            </Container>
        </Layout>
    );
};

export default VerifyKYC;
