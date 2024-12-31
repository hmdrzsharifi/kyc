// pages/level1.js
import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import { getToken } from '@/pages/auth/config/keycloak';
import Layout from "@/Layout";

const Level1 = () => {
    const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', userId: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        const token = await getToken();
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await axios.post('http://172.31.13.30:5000/api/kyc/level1', formData , {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('Level 1 verification completed successfully.');
            setFormData({ firstname: '', lastname: '', email: '', userId: '' });
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
        }
    };

    return (
        <Layout>
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>Level 1 Verification</Typography>
            {message && <Alert severity="success">{message}</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            <form onSubmit={handleSubmit}>
                <TextField
                    label="User ID"
                    name="userId"
                    value={formData.userId}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="First Name"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>Submit</Button>
            </form>
        </Container>
        </Layout>
    );
};

export default Level1;