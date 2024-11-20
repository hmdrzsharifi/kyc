import React, {useRef, useState} from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    Grid,
    Button,
    Paper,
    Box,
    Avatar,
    Divider, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DocumentDetailsPopup = ({ open, onClose, document }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);

    if (!document) return null;

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseImageDialog = () => {
        setSelectedImage(null);
    };

    const handleWheel = (event) => {
        // کنترل زوم با اسکرول موس
        const scaleFactor = 0.1;
        const zoomIncrement = event.deltaY < 0 ? scaleFactor : -scaleFactor;
        setZoomLevel((prevZoom) => {
            const newZoom = prevZoom + zoomIncrement;
            return Math.min(Math.max(newZoom, 1), 3); // حداکثر زوم 3 برابر و حداقل زوم 1 برابر
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <DialogTitle sx={{ backgroundColor: '#007BFF', color: 'white', textAlign: 'center', padding: '16px' }}>
                Document Details
            </DialogTitle>

            <DialogContent sx={{ backgroundColor: '#f5f5f5', padding: '24px' }}>
                <Grid container spacing={4}>

                    {/* General Information Section */}
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={6} sx={{ padding: 3, backgroundColor: '#ffffff', borderRadius: '12px' }}>
                            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#007BFF' }}>
                                General Information
                            </Typography>
                            <List sx={{ padding: 0 }}>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Document Type" secondary={document.document.document_type} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Document Number" secondary={document.document.document_number} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Issued Country" secondary={document.document.issued_country} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText
                                        primary="Expiration Date"
                                        secondary={new Date(document.document.expiration_date).toLocaleDateString()}
                                    />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Verification Status" secondary={document.document.verification_status} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Gender" secondary={document.document.gender} />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Uploaded At"
                                        secondary={new Date(document.document.uploaded_at).toLocaleString()}
                                    />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Address Section */}
                    <Grid item xs={12} sm={6}>
                        <Paper elevation={6} sx={{ padding: 3, backgroundColor: '#ffffff', borderRadius: '12px' }}>
                            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#007BFF' }}>
                                Address
                            </Typography>
                            <List sx={{ padding: 0 }}>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Street" secondary={document.document.address?.street} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="City" secondary={document.document.address?.city} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="State" secondary={document.document.address?.state} />
                                </ListItem>
                                <ListItem sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <ListItemText primary="Country" secondary={document.document.address?.country} />
                                </ListItem>
                            </List>
                        </Paper>
                    </Grid>

                    {/* Document Images Section */}
                    <Grid item xs={12}>
                        <Paper elevation={6} sx={{ padding: 3, backgroundColor: '#ffffff', borderRadius: '12px' }}>
                            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#007BFF' }}>
                                Document Images
                            </Typography>
                            {document.documentImages && document.documentImages.length > 0 ? (
                                <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    {document.documentImages.map((image, index) => (
                                        <Grid item xs={12} sm={6} md={4} key={index}>
                                            <Box
                                                sx={{
                                                    border: '1px solid #ddd',
                                                    borderRadius: 2,
                                                    padding: 1,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    boxShadow: '2px 2px 10px rgba(0, 0, 0, 0.1)',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.3s',
                                                    '&:hover': {
                                                        transform: 'scale(1.05)',
                                                        boxShadow: '4px 4px 15px rgba(0, 0, 0, 0.2)',
                                                    },
                                                }}
                                                onClick={() => handleImageClick(image)}
                                            >
                                                <Avatar
                                                    alt={`Document Image ${index + 1}`}
                                                    src={`data:${image.type};base64,${image.base64}`}
                                                    sx={{
                                                        width: 120,
                                                        height: 120,
                                                        borderRadius: 2,
                                                        objectFit: 'cover',
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
                                    No document images available
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Video Section */}
                    <Grid item xs={12}>
                        <Paper elevation={6} sx={{ padding: 3, backgroundColor: '#ffffff', borderRadius: '12px' }}>
                            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold', color: '#007BFF' }}>
                                Video Details
                            </Typography>
                            {document.documentVideo?.base64 ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <video controls style={{ maxWidth: '100%', borderRadius: '8px' }}>
                                        <source
                                            src={`data:${document.documentVideo.type};base64,${document.documentVideo.base64}`}
                                            type={document.documentVideo.type}
                                        />
                                        Your browser does not support the video tag.
                                    </video>
                                </Box>
                            ) : (
                                <Typography variant="body1" sx={{ textAlign: 'center', color: 'gray' }}>
                                    No video uploaded
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>

            <Box sx={{ textAlign: 'center', padding: 2, backgroundColor: '#f3f8fc' }}>
                <Button
                    onClick={onClose}
                    color="primary"
                    variant="contained"
                    sx={{
                        borderRadius: '25px',
                        paddingX: 5,
                        paddingY: 1.5,
                        backgroundColor: '#007BFF',
                        '&:hover': {
                            backgroundColor: '#0056b3',
                        },
                    }}
                >
                    Close
                </Button>
            </Box>

            {/* Image Zoom Dialog */}
            <Dialog open={Boolean(selectedImage)} onClose={handleCloseImageDialog} maxWidth="md" fullWidth>
                <DialogTitle
                    sx={{
                        backgroundColor: '#007BFF',
                        color: 'white',
                        textAlign: 'center',
                        padding: '8px 16px', // کم کردن padding برای نازک‌تر شدن
                        position: 'relative',
                    }}
                >
                    Image Details
                    <IconButton
                        onClick={handleCloseImageDialog}
                        sx={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            color: 'white',
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ padding: 0 }}>
                    {selectedImage && (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '24px',
                                cursor: 'zoom-in', // تغییر وضعیت موس به حالت زوم
                            }}
                            onWheel={handleWheel} // اضافه کردن شنونده اسکرول موس
                        >
                            <Box
                                sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'default', // حالت موس به حالت زوم تغییر نمی‌کند
                                }}
                            >
                                <img
                                    src={`data:${selectedImage.type};base64,${selectedImage.base64}`}
                                    alt="Selected Document"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        borderRadius: '8px',
                                        transform: `scale(${zoomLevel})`, // زوم کردن تصویر
                                        objectFit: 'contain',
                                        transition: 'transform 0.3s ease', // انیمیشن زوم
                                    }}
                                />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default DocumentDetailsPopup;
