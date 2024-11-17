import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import axios from 'axios';

const KycStatus = () => {
    const [status, setStatus] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://172.31.13.30:5000/api/kyc/status', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setStatus(response.data.kyc_status);
            } catch (err) {
                console.error(err);
            }
        };

        fetchStatus();
    }, []);

    if (status === null) {
        return (
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Typography variant="h4" gutterBottom>KYC Status</Typography>
                <Typography variant="h6" color="primary">{status}</Typography>
            </Box>
        </Container>
    );
};

export default KycStatus;
