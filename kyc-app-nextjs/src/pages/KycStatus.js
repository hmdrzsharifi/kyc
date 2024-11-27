import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../Layout';
import { getToken } from '@/pages/auth/config/keycloak';
import { useKeycloak } from '@/pages/auth/provider/KeycloakProvider';

const KycStatus = () => {
    const [status, setStatus] = useState(null);
    const router = useRouter();
    const { user } = useKeycloak();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const token = await getToken();
                const response = await axios.post('http://172.31.13.30:5000/api/kyc/status',
                    {
                        user_email: user.email
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setStatus(response.data.kyc_status);
            } catch (err) {
                console.error(err);
                setStatus('error'); // Set to error in case of a request failure
            }
        };

        fetchStatus();
    }, []);

    if (status === null) {
        return (
            <Layout>
                <Container maxWidth="sm">
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                        }}
                    >
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }} variant="h6" color="textSecondary">
                            Please wait while we check your KYC status...
                        </Typography>
                    </Box>
                </Container>
            </Layout>
        );
    }

    const renderStatus = () => {
        switch (status) {
            case 'approved':
                return (
                    <Box sx={{ textAlign: 'center', color: 'green' }}>
                        <CheckCircleIcon sx={{ fontSize: 80 }} />
                        <Typography variant="h5" sx={{ mt: 2 }}>
                            Your KYC is Approved! 🎉
                        </Typography>
                        <Box
                            sx={{
                                border: '1px solid #4caf50',
                                borderRadius: 2,
                                padding: 2,
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                mt: 3,
                                textAlign: 'center',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Typography variant="h6">
                                Your identity verification is complete. You can now proceed to use the platform.
                            </Typography>
                        </Box>
                    </Box>
                );
            case 'pending':
                return (
                    <Box sx={{ textAlign: 'center', color: 'orange' }}>
                        <HourglassEmptyIcon sx={{ fontSize: 80 }} />
                        <Typography variant="h5" sx={{ mt: 2 }}>
                            Your KYC Document Are Not Uploaded.
                        </Typography>
                        <Typography sx={{ mt: 2 }} variant="body1" color="textSecondary">
                            Please Complete Your Registration .
                        </Typography>
                    </Box>
                );
            case 'documents_uploaded':
                return (
                    <Box sx={{ textAlign: 'center', color: 'blue' }}>
                        <UploadFileIcon sx={{ fontSize: 80 }} />
                        <Typography variant="h5" sx={{ mt: 2 }}>
                            Documents Uploaded Successfully!
                        </Typography>
                        <Typography sx={{ mt: 2 }} variant="body1" color="textSecondary">
                            We have received your documents. Our team will review them soon.
                        </Typography>
                    </Box>
                );
            case 'rejected':
                return (
                    <Box sx={{ textAlign: 'center', color: '#d32f2f' }}>
                        <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
                        <Typography variant="h5" sx={{ mt: 2, color: '#d32f2f' }}>
                            Your KYC Was Rejected.
                        </Typography>
                        <Typography sx={{ mt: 2, color: '#616161' }} variant="body1">
                            Unfortunately, your identity verification was not successful. Please check your documents and try again.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{
                                mt: 3,
                                backgroundColor: '#e53935',
                                color: '#ffffff',
                                '&:hover': {
                                    backgroundColor: '#b71c1c',
                                },
                            }}
                            onClick={() => router.push('/kyc-upload')}
                        >
                            Retry KYC Process
                        </Button>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Layout>
            <Container maxWidth="sm">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        KYC Status
                    </Typography>
                    {renderStatus()}
                </Box>
            </Container>
        </Layout>
    );
};

export default KycStatus;
