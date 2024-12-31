// pages/upload-documents.js
import React, { useState } from 'react';
import { Box, Button, Grid, TextField, Typography, MenuItem } from '@mui/material';
import axios from 'axios';
import {getToken} from "@/pages/auth/config/keycloak";
import Layout from "@/Layout";

const UploadDocuments = () => {
    const [formData, setFormData] = useState({
        identityType: '',
        addressLine1: '',
        addressLine2:'',
        city: '',
        state: '',
        postalCode: '',
        country: '',
    });

    const [files, setFiles] = useState({
        bill: null,
        identity: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const allowedIdentityTypes = ['passport', 'drivers_license', 'national_id'];

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        const token = await getToken();
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const data = new FormData();
        data.append('identityType', formData.identityType);
        data.append('addressLine1', formData.addressLine1);
        data.append('addressLine2', formData.addressLine2);
        data.append('city', formData.city);
        data.append('state', formData.state);
        data.append('postalCode', formData.postalCode);
        data.append('country', formData.country);

        if (files.bill) data.append('bill', files.bill);
        if (files.identity) data.append('identity', files.identity);

        try {
            const response = await axios.post('http://172.31.13.30:5000/api/kyc/upload-documents', data, {
                headers: { 'Content-Type': 'multipart/form-data' ,  Authorization: `Bearer ${token}`},
            });
            setSuccess(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
            <Typography variant="h4" mb={2} align="center">
                Upload Documents
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* Identity Type */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            fullWidth
                            label="Identity Type"
                            name="identityType"
                            value={formData.identityType}
                            onChange={handleInputChange}
                            required
                        >
                            {allowedIdentityTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type.replace('_', ' ').toUpperCase()}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Address Fields */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address Line 1"
                            name="addressLine1"
                            value={formData.addressLine1}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Address Line 2"
                            name="addressLine2"
                            value={formData.addressLine2}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="State"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>

                    {/* File Uploads */}
                    <Grid item xs={12}>
                        <Typography variant="body1" mb={1}>
                            Upload Bill Document
                        </Typography>
                        <Button variant="contained" component="label">
                            Choose File
                            <input
                                type="file"
                                name="bill"
                                accept="application/pdf,image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>
                        {files.bill && <Typography mt={1}>{files.bill.name}</Typography>}
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body1" mb={1}>
                            Upload Identity Document
                        </Typography>
                        <Button variant="contained" component="label">
                            Choose File
                            <input
                                type="file"
                                name="identity"
                                accept="application/pdf,image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>
                        {files.identity && <Typography mt={1}>{files.identity.name}</Typography>}
                    </Grid>

                    {/* Error and Success Messages */}
                    {error && (
                        <Grid item xs={12}>
                            <Typography color="error">{error}</Typography>
                        </Grid>
                    )}
                    {success && (
                        <Grid item xs={12}>
                            <Typography color="primary">{success}</Typography>
                        </Grid>
                    )}

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            disabled={loading}
                        >
                            {loading ? 'Uploading...' : 'Submit'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
            </Layout>
    );
};

export default UploadDocuments;
