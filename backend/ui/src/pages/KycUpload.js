import React, { useState } from 'react';
import { Button, TextField, Container, Typography, Box, Grid, IconButton } from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete'; // برای آیکن حذف

const KycUpload = () => {
    const [documentType, setDocumentType] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [issuedCountry, setIssuedCountry] = useState('');
    const [documents, setDocuments] = useState([]);
    const [error, setError] = useState('');

    // تبدیل FileList به آرایه و افزودن فایل‌ها به state
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setDocuments((prevDocuments) => [...prevDocuments, ...files]);
    };

    // حذف فایل از لیست
    const handleRemoveFile = (index) => {
        setDocuments((prevDocuments) => prevDocuments.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('document_type', documentType);
        formData.append('document_number', documentNumber);
        formData.append('expiration_date', expirationDate);
        formData.append('issued_country', issuedCountry);

        // اضافه کردن تمام فایل‌ها به FormData
        documents.forEach((file) => {
            formData.append('documents', file);
        });

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/kyc/upload-documents', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Documents uploaded successfully');
            setError('')

            // پاک کردن فایل‌ها و فیلدها بعد از آپلود موفق
            setDocumentType('');
            setDocumentNumber('');
            setExpirationDate('');
            setIssuedCountry('');
            setDocuments([]); // پاک کردن فایل‌ها
        } catch (err) {
            setError('Failed to upload documents');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
                <Typography variant="h4" gutterBottom>Upload KYC Documents</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <TextField
                    label="Document Type"
                    variant="outlined"
                    fullWidth
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Document Number"
                    variant="outlined"
                    fullWidth
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Expiration Date"
                    type="date"
                    fullWidth
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    label="Issued Country"
                    variant="outlined"
                    fullWidth
                    value={issuedCountry}
                    onChange={(e) => setIssuedCountry(e.target.value)}
                    sx={{ mb: 2 }}
                />

                {/* دکمه آپلود فایل با Material-UI */}
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }} // پنهان کردن ورودی فایل
                />
                <label htmlFor="file-upload">
                    <Button variant="contained" component="span" sx={{ mb: 2 , color:"#ffff" , backgroundColor:"#10223a"}}>
                        Upload Files
                    </Button>
                </label>

                {/* نمایش پیش‌نمایش تصاویر */}
                {documents.length > 0 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 1 }}>Uploaded Files:</Typography>
                            <Grid container spacing={2}>
                                {documents.map((file, index) => (
                                    <Grid item xs={4} key={index}>
                                        <Box sx={{ position: 'relative' }}>
                                            {/* آیکن حذف */}
                                            <IconButton
                                                onClick={() => handleRemoveFile(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    color: 'red',
                                                    backgroundColor: 'white',
                                                    borderRadius: '50%',
                                                    zIndex: 1,
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                            <img
                                                src={URL.createObjectURL(file)} // ساخت URL برای نمایش تصویر
                                                alt={`file-preview-${index}`}
                                                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                )}

                <Button variant="contained" color="primary" onClick={handleUpload} sx={{ mt: 2 }}>
                    Upload Documents
                </Button>
            </Box>
        </Container>
    );
};

export default KycUpload;
