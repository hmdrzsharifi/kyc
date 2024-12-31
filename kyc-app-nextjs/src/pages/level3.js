import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
import Layout from "@/Layout";
import { getToken } from "@/pages/auth/config/keycloak";
import { useKeycloak } from "@/pages/auth/provider/KeycloakProvider";

const Level3 = () => {
    const [formData, setFormData] = useState({ address: '', postalCode: '', landline: '', email: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { user } = useKeycloak();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        const token = await getToken();
        e.preventDefault();
        setError('');
        setMessage('');

        // Directly set the email in the formData state
        setFormData(prevData => ({ ...prevData, email: user.email[1] }));

        try {
            const response = await axios.post('http://172.31.13.30:5000/api/kyc/level3', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMessage('Level 3 verification completed successfully.');
            setFormData({ address: '', postalCode: '', landline: '', email: '' });
        } catch (err) {
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
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Postal Code"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Landline"
                        name="landline"
                        value={formData.landline}
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

export default Level3;
