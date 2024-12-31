import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import Layout from "@/Layout";  // Assuming Layout handles login/logout
import { getToken } from "@/pages/auth/config/keycloak";  // Assuming token is stored here

const Level3Verification = () => {
    const [formData, setFormData] = useState({ email: '', status: '', rejectionReason: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Handle form data changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Validate rejection reason if status is rejected
        if (formData.status === 'rejected' && !formData.rejectionReason) {
            setError('Rejection reason is required when status is "rejected".');
            return;
        }

        try {
            const token = await getToken();  // Get the token

            // Log the token and form data for debugging
            console.log('Token:', token);
            console.log('Form Data:', formData);

            // API request to update Level 3 verification
            const response = await axios.post('http://172.31.13.30:5000/api/admin/verify-level3', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,  // Sending the token with the request
                },
            });

            // Success message on successful verification
            setMessage('Level 3 verification status updated successfully.');
        } catch (err) {
            // Error handling
            console.error('Error Response:', err.response);
            setError(err.response?.data?.error || 'An error occurred.');
        }
    };

    return (
        <Layout>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom>Level 3 Verification</Typography>
                {message && <Alert severity="success">{message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Status (approved/rejected)"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    {formData.status === 'rejected' && (
                        <TextField
                            label="Rejection Reason"
                            name="rejectionReason"
                            value={formData.rejectionReason}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                    )}
                    <Button type="submit" variant="contained" color="primary" fullWidth>Submit</Button>
                </form>
            </Container>
        </Layout>
    );
};

export default Level3Verification;
