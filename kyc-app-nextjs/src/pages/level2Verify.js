import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import Layout from "@/Layout";  // Assuming Layout handles login/logout
import { useKeycloak } from "@/pages/auth/provider/KeycloakProvider";
import {getToken} from "@/pages/auth/config/keycloak";  // Using context for the token

const Level2Verification = () => {
    const [formData, setFormData] = useState({ email: '', status: '', rejectionReason: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
      // Assuming token is provided via context

    // Handle form data changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        const token = await getToken();

        // Validate rejection reason if status is rejected
        if (formData.status === 'rejected' && !formData.rejectionReason) {
            setError('Rejection reason is required when status is "rejected".');
            return;
        }

        try {
            // Log the token and form data for debugging
            console.log('Token:', token);
            console.log('Form Data:', formData);

            const response = await axios.post('http://172.31.13.30:5000/api/admin/verify-level2', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,  // Sending the token with the request
                },
            });

            setMessage('Level 2 verification status updated successfully.');
        } catch (err) {
            // Log the error response for debugging
            console.error('Error Response:', err.response);
            setError(err.response?.data?.error || 'An error occurred.');
        }
    };


    return (
        <Layout>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom>Level 2 Verification</Typography>
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

// API call for the server-side verification
// export async function getServerSideProps(context) {
//     if (context.req.method === 'POST') {
//         const { email, status, rejectionReason } = context.body;
//
//         try {
//             const response = await axios.post('http://172.31.13.30:5000/api/admin/kyc/verify-level2', {
//                 email,
//                 status,
//                 rejectionReason
//             }, {
//                 headers: {
//                     Authorization: context.req.headers['authorization'],
//                 }
//             });
//
//             return {
//                 props: { message: 'Level 2 verification status updated successfully.' }
//             };
//         } catch (error) {
//             return {
//                 props: { error: error.response?.data?.error || 'An error occurred.' }
//             };
//         }
//     }
//
//     return { props: {} };
// }

export default Level2Verification;
