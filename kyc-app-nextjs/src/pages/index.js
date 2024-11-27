import React from 'react';
import Layout from '../Layout';
import Link from 'next/link';
import { useKeycloak } from '@/pages/auth/provider/KeycloakProvider';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { Email, Person } from '@mui/icons-material';

const IndexPage = () => {
    const { logout, user } = useKeycloak();

    return (
        <Layout>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome to the KYC Management System</h1>

            {user && (
                <Box display="flex" justifyContent="center" alignItems="center" marginTop="20px">
                    <Card sx={{ maxWidth: 345, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* Center Avatar */}
                            <Avatar
                                src="/icons8-video-id-verification-50.png"
                                sx={{ width: 50, height: 50, marginBottom: 2 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ marginRight: 1 }} />
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                                <Email sx={{ marginRight: 1 }} />
                                {user?.email}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Layout>
    );
};

export default IndexPage;
