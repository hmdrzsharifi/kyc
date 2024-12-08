import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Link } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState(''); // افزودن state برای firstName
    const [lastName, setLastName] = useState(''); // افزودن state برای lastName
    const [userName, setUserName] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async () => {
        try {
            // ارسال داده‌ها به سرور شامل firstName و lastName
            await axios.post('http://172.31.13.30:5000/api/auth/register', {
                email,
                password,
                firstName, // ارسال firstName
                lastName,
                userName,
            });
            router.push('/'); // هدایت به صفحه لاگین بعد از موفقیت در ثبت‌نام
        } catch (err) {
            setError('User already exists');
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
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // پس‌زمینه نیمه شفاف برای فرم
                padding: 3,
                borderRadius: 2
            }}>
                <Typography variant="h4" gutterBottom>Register</Typography>
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
                <TextField
                    label="User Name"
                    variant="outlined"
                    fullWidth
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)} // اضافه کردن onChange برای firstName
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="First Name"
                    variant="outlined"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)} // اضافه کردن onChange برای firstName
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)} // اضافه کردن onChange برای lastName
                    sx={{ mb: 2 }}
                />
                <Button variant="contained" color="primary" onClick={handleRegister}>
                    Register
                </Button>

                {/* متن راهنما برای هدایت به صفحه لاگین */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="body1">
                        If you already have an account?{' '}
                    </Typography>
                    <Link
                        component="button"
                        variant="inherit"
                        onClick={() => router.push('/login')} // هدایت به صفحه لاگین
                        sx={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px' }}
                    >
                        Login
                    </Link>
                </Box>
            </Box>
        </Container>
    );
};

export default Register;
