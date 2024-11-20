import React, { useState } from 'react';
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    Grid,
    IconButton,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Snackbar, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/router';
import Layout from '../Layout';
import axios from "axios";

const KycUpload = () => {
    const [documentType, setDocumentType] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [issuedCountry, setIssuedCountry] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    }); // state برای آدرس
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleFileDrop = (files, index) => {
        const newFiles = [...documents];
        newFiles[index] = files[0];
        setDocuments(newFiles);
    };

    const handleRemoveFile = (index) => {
        const newFiles = [...documents];
        newFiles[index] = null;
        setDocuments(newFiles);
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('document_number', documentNumber);
        formData.append('expiration_date', expirationDate);
        formData.append('issued_country', issuedCountry);
        formData.append('gender', gender);

        // اضافه کردن آدرس به فرم دیتا
        formData.append('address[street]', address.street);
        formData.append('address[city]', address.city);
        formData.append('address[state]', address.state);
        formData.append('address[postalCode]', address.postalCode);
        formData.append('address[country]', address.country);

        documents.forEach((file, index) => {
            if (file) {
                formData.append(`document_${index + 1}`, file);
            }
        });

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://172.31.13.30:5000/api/kyc/upload-documents', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSnackbarMessage('Documents uploaded successfully');
            setSnackbarSeverity('success');
            setError('');
            setOpenSnackbar(true);


            setDocumentType('');
            setDocumentNumber('');
            setExpirationDate('');
            setIssuedCountry('');
            setGender('');
            setAddress({
                street: '',
                city: '',
                state: '',
                postalCode: '',
                country: ''
            }); // بازنشانی آدرس
            setDocuments([]);
            setTimeout(async () => {
                await router.push('/KycStatus');
            }, 3000);
        } catch (err) {
            setError('Failed to upload documents');
            setSnackbarMessage('Failed to upload documents');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const documentNames = ['Passport', 'Driving License', 'ID Card', 'Utility Bill'];

    const renderUploadBox = (index) => (
        <Box
            key={index}
            sx={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: documents[index] ? '#f0f8ff' : 'white',
                flexDirection: 'column',
                gap: 1,
            }}
            onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                handleFileDrop(files, index);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const files = Array.from(e.target.files);
                    handleFileDrop(files, index);
                };
                input.click();
            }}
        >
            {documents[index] ? (
                <>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile(index);
                        }}
                        sx={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'white',
                            color: 'red',
                            zIndex: 1,
                        }}
                    >
                        <DeleteIcon />
                    </IconButton>
                    <img
                        src={URL.createObjectURL(documents[index])}
                        alt={`uploaded-file-${index}`}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                </>
            ) : (
                <>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                        {documentNames[index]}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Drag & Drop or Click to Upload
                    </Typography>
                </>
            )}
        </Box>
    );

    return (
        <Layout>
            <Container maxWidth="large">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                    <Typography variant="h4" gutterBottom>Upload KYC Documents</Typography>
                    {error && <Typography color="error">{error}</Typography>}

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={3}>
                            <TextField
                                label="Document Type"
                                variant="outlined"
                                fullWidth
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Document Number"
                                variant="outlined"
                                fullWidth
                                value={documentNumber}
                                onChange={(e) => setDocumentNumber(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Expiration Date"
                                type="datetime-local"
                                fullWidth
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Issued Country"
                                variant="outlined"
                                fullWidth
                                value={issuedCountry}
                                onChange={(e) => setIssuedCountry(e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select
                                    value={gender}
                                    onChange={(e) => setGender(e.target.value)}
                                    label="Gender"
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Street"
                                variant="outlined"
                                fullWidth
                                value={address.street}
                                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="City"
                                variant="outlined"
                                fullWidth
                                value={address.city}
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="State"
                                variant="outlined"
                                fullWidth
                                value={address.state}
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={3}>
                            <TextField
                                label="Postal Code"
                                variant="outlined"
                                fullWidth
                                value={address.postalCode}
                                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField
                                label="Country"
                                variant="outlined"
                                fullWidth
                                value={address.country}
                                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                            />
                        </Grid>
                    </Grid>

                    {/* File Upload */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {[0, 1, 2, 3].map((index) => (
                            <Grid item xs={6} key={index}>
                                {renderUploadBox(index)}
                            </Grid>
                        ))}
                    </Grid>

                    <Button variant="contained" color="primary" onClick={handleUpload}>
                        Upload Documents
                    </Button>
                </Box>
            </Container>
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert severity={snackbarSeverity} onClose={() => setOpenSnackbar(false)}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Layout>
    );
};

export default KycUpload;
