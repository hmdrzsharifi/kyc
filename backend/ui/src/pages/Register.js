import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Link } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            await axios.post('http://172.31.13.30:5000/api/auth/register', { email, password });
            navigate('/login'); // هدایت به صفحه لاگین
        } catch (err) {
            setError('User already exists');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
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
                <Button variant="contained" color="primary" onClick={handleRegister}>
                    Register
                </Button>

                {/* متن راهنما برای کاربر */}
                <Typography variant="body2" sx={{ mt: 2 }}>
                    If you already have an account?{' '}
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate('/login')} // هدایت به صفحه لاگین
                        sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                    >
                        Login
                    </Link>
                </Typography>
            </Box>
        </Container>
    );
};

export default Register;
