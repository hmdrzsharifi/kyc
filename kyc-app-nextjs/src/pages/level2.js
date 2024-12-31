import React, { useState, useCallback } from 'react';
import { Container, TextField, Button, Typography, Alert, Box, IconButton, Grid } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraIcon from '@mui/icons-material/CameraAlt';
import axios from 'axios';
import Layout from "@/Layout";
import { getToken } from "@/pages/auth/config/keycloak";
import { useKeycloak } from '@/pages/auth/provider/KeycloakProvider';
import Webcam from 'react-webcam';

const FileUpload = ({ label, file, setFile }) => {
    const [preview, setPreview] = useState(null);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    return (
        <Box sx={{ border: '2px dashed #ccc', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            {file ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img
                        src={preview}
                        alt="preview"
                        style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }}
                    />
                    <IconButton onClick={() => setFile(null)}>
                        <DeleteIcon color="error" />
                    </IconButton>
                </Box>
            ) : (
                <Typography color="textSecondary">Drag & drop {label} here, or click to select</Typography>
            )}
        </Box>
    );
};

const CameraCapture = ({ file, setFile }) => {
    const webcamRef = React.useRef(null);
    const [image, setImage] = useState(null);
    const [capturing, setCapturing] = useState(false);

    const capture = useCallback(() => {
        const screenshot = webcamRef.current.getScreenshot();
        setImage(screenshot);
        setCapturing(false);
        setFile(screenshot);
    }, [webcamRef, setFile]);

    const reset = () => {
        setImage(null);
        setFile(null);
        setCapturing(true);
    };

    return (
        <Box sx={{ textAlign: 'center', marginTop: '100px' }}>
            {!image && capturing ? (
                <Box sx={{ position: 'relative' }}>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        videoConstraints={{ facingMode: 'environment' }}
                    />
                    <IconButton onClick={capture} sx={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                        <CameraIcon fontSize="large" />
                    </IconButton>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <img src={image} alt="Captured" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                    <Button variant="contained" onClick={reset} sx={{ marginTop: '8px' }}>Take Another Photo</Button>
                </Box>
            )}
        </Box>
    );
};

const Level2 = () => {
    const [formData, setFormData] = useState({ bankAccount: '', phoneNumber: '' });
    const [passport, setPassport] = useState(null);
    const [driverLicense, setDriverLicense] = useState(null);
    const [nationalId, setNationalId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState('');
    const { user } = useKeycloak();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const base64ToBlob = (base64) => {
        const byteString = atob(base64.split(',')[1]);
        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        const buffer = new ArrayBuffer(byteString.length);
        const byteArray = new Uint8Array(buffer);
        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([buffer], { type: mimeString });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const token = await getToken();
            const form = new FormData();
            form.append('email', user.email[1]);
            form.append('bankAccount', formData.bankAccount);
            form.append('phoneNumber', formData.phoneNumber);

            if (passport) form.append('passport', passport);
            if (driverLicense) form.append('driverLicense', driverLicense);
            if (nationalId) form.append('nationalId', nationalId);

            // تبدیل Base64 به فایل و اضافه کردن به FormData
            if (photo) {
                const photoBlob = base64ToBlob(photo);
                form.append('photo', photoBlob, 'photo.jpg'); // نام فایل را تنظیم کنید
            }

            const response = await axios.post('http://172.31.13.30:5000/api/kyc/level2', form, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage('Level 2 verification completed successfully.');
            setFormData({ bankAccount: '', phoneNumber: '' });
            setPassport(null);
            setDriverLicense(null);
            setNationalId(null);
            setPhoto(null);
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred.');
        }
    };


    return (
        <Layout>
            <Container maxWidth="sm">
                <Typography variant="h4" gutterBottom>Level 2 Verification</Typography>
                {message && <Alert severity="success" sx={{ marginBottom: '16px' }}>{message}</Alert>}
                {error && <Alert severity="error" sx={{ marginBottom: '16px' }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Bank Account"
                        name="bankAccount"
                        value={formData.bankAccount}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
                        <Grid item xs={4}>
                            <FileUpload label="Passport" file={passport} setFile={setPassport} />
                        </Grid>
                        <Grid item xs={4}>
                            <FileUpload label="Driver License" file={driverLicense} setFile={setDriverLicense} />
                        </Grid>
                        <Grid item xs={4}>
                            <FileUpload label="National ID" file={nationalId} setFile={setNationalId} />
                        </Grid>
                    </Grid>

                    <CameraCapture file={photo} setFile={setPhoto} />

                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ marginTop: '16px' }}>Submit</Button>
                </form>
            </Container>
        </Layout>
    );
};

export default Level2;
