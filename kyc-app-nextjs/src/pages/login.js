import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../Layout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();  // استفاده از useRouter برای هدایت به صفحات مختلف

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://172.31.13.30:5000/api/auth/login', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            router.push('/KycStatus'); // هدایت به صفحه kyc-status بعد از موفقیت در ورود
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <Container maxWidth="large" sx={{
            height: '100vh',  // کل ارتفاع صفحه
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 0,
            backgroundImage: 'url("/kyc-text-hand.jpg")', // آدرس تصویر پس‌زمینه
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 3, borderRadius: 2 }}>
                {/* اضافه کردن آیکون بالای فرم */}
                <Box sx={{ mb: 2 }}>
                    <img src="/icons8-video-id-verification-50.png" alt="ID Verification" width={50} height={50} />
                </Box>
                <Typography variant="h4" gutterBottom>Login</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" onClick={handleLogin}>
                    Login
                </Button>
            </Box>
        </Container>
    );
};

export default Login;
