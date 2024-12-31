import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    CircularProgress,
    TextField,
    Button,
    Modal,
    IconButton,
} from '@mui/material';
import { getToken } from "@/pages/auth/config/keycloak";
import Layout from "@/Layout";
import CloseIcon from '@mui/icons-material/Close';

const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
};

const VerificationPage = () => {
    const [userId, setUserId] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = await getToken();

        if (!userId) {
            setError('User ID is required');
            return;
        }

        setLoading(true);
        setError(null);

        // ارسال userId به سرور
        await axios
            .post(
                'http://172.31.13.30:5000/api/kyc/verifications',
                { userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )
            .then((response) => {
                setData(response.data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.response?.data?.error || 'Failed to fetch data');
                setLoading(false);
            });
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setOpenModal(true);
    };

    const closeImageModal = () => {
        setOpenModal(false);
        setSelectedImage('');
    };

    return (
        <Layout>
            <Box p={4}>
                {/* فرم ورودی برای دریافت userId */}
                {!data && (
                    <form onSubmit={handleSubmit}>
                        <Typography variant="h4" mb={3}>
                            Enter User ID
                        </Typography>
                        <TextField
                            label="User ID"
                            variant="outlined"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            fullWidth
                            required
                            margin="normal"
                        />
                        {error && <Typography color="error">{error}</Typography>}
                        <Button type="submit" variant="contained" color="primary">
                            Submit
                        </Button>
                    </form>
                )}

                {/* نمایش وضعیت لودینگ */}
                {loading && (
                    <Box display="flex" justifyContent="center" mt={3}>
                        <CircularProgress />
                    </Box>
                )}

                {/* نمایش داده‌ها بعد از ارسال فرم */}
                {data && (
                    <Box mt={4}>
                        <Typography variant="h4" mb={3}>
                            Verification Details for User {userId}
                        </Typography>
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    {/* سطح 1 */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">Level 1 Information:</Typography>
                                        <Typography>First Name: {data.verification.level1?.firstname || 'N/A'}</Typography>
                                        <Typography>Last Name: {data.verification.level1?.lastname || 'N/A'}</Typography>
                                        <Typography>Email: {data.verification.level1?.email || 'N/A'}</Typography>
                                    </Grid>

                                    {/* سطح 2 */}
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="subtitle1">Level 2 Information:</Typography>
                                        <Typography>Bank Account: {data.verification.level2?.bankAccount || 'N/A'}</Typography>
                                        <Typography>Phone Number: {data.verification.level2?.phoneNumber || 'N/A'}</Typography>
                                        <Box mt={2} display="flex">
                                            {data.images?.passport && (
                                                <IconButton onClick={() => openImageModal(data.images.passport)}>
                                                    <img
                                                        src={data.images.passport}
                                                        alt="Passport"
                                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </IconButton>
                                            )}
                                            {data.images?.driverLicense && (
                                                <IconButton onClick={() => openImageModal(data.images.driverLicense)}>
                                                    <img
                                                        src={data.images.driverLicense}
                                                        alt="Driver License"
                                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </IconButton>
                                            )}
                                            {data.images?.nationalId && (
                                                <IconButton onClick={() => openImageModal(data.images.nationalId)}>
                                                    <img
                                                        src={data.images.nationalId}
                                                        alt="National ID"
                                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                                                    />
                                                </IconButton>
                                            )}
                                        </Box>
                                    </Grid>

                                    {/* سطح 3 */}
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle1">Level 3 Information:</Typography>
                                        <Typography>Address: {data.verification.level3?.address || 'N/A'}</Typography>
                                        <Typography>Postal Code: {data.verification.level3?.postalCode || 'N/A'}</Typography>
                                        <Typography>Landline: {data.verification.level3?.landline || 'N/A'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Modal برای نمایش عکس‌ها */}
                <Modal
                    open={openModal}
                    onClose={closeImageModal}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <Box sx={style}>
                        <Box position="relative" display="flex" justifyContent="center" alignItems="center">
                            <img
                                src={selectedImage}
                                alt="modal view"
                                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }}
                            />
                            <IconButton
                                onClick={closeImageModal}
                                style={{ position: 'absolute', top: 8, right: 8 }}
                                aria-label="close"
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Modal>
            </Box>
        </Layout>
    );
};

export default VerificationPage;
