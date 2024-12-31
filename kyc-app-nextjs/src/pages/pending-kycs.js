import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import axios from 'axios';
import { getToken } from "@/pages/auth/config/keycloak";

const PendingKYCs = () => {
    const [kycs, setKycs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [kycDetails, setKycDetails] = useState(null);

    useEffect(() => {
        const fetchPendingKYCs = async () => {
            const token = await getToken();
            try {
                const response = await axios.get('http://172.31.13.30:5000/api/admin/pending-kycs', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const formattedData = response.data.map((kyc) => ({
                    id: kyc._id,
                    user: kyc.user ? `${kyc.user.firstName} ${kyc.user.lastName}` : 'N/A',
                    userId: kyc.userId || 'N/A',
                    address: kyc.address
                        ? `${kyc.address.addressLine1}, ${kyc.address.city}, ${kyc.address.country}`
                        : 'N/A',
                    billDocument: kyc.documents?.billDocument?.base64File
                        ? `data:image/jpeg;base64,${kyc.documents.billDocument.base64File}`
                        : null,
                    identityDocument: kyc.documents?.idDocument?.base64File
                        ? `data:image/jpeg;base64,${kyc.documents.idDocument.base64File}`
                        : null,
                    status: kyc.status || 'N/A',
                }));

                setKycs(formattedData);
            } catch (error) {
                console.error('Error fetching KYC data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPendingKYCs();
    }, []);

    const handleOpenDetails = (kyc) => {
        setKycDetails(kyc);
        setOpen(true);
    };

    const handleCloseDetails = () => {
        setOpen(false);
        setKycDetails(null);
    };

    const columns = [
        { field: 'userId', headerName: 'User ID', width: 180 },
        { field: 'user', headerName: 'User', width: 180 },
        { field: 'address', headerName: 'Address', width: 300 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button variant="contained" color="primary" onClick={() => handleOpenDetails(params.row)}>
                    View Details
                </Button>
            ),
        },
    ];

    return (
        <Box sx={{ height: 600, width: '100%', padding: 2 }}>
            <Typography variant="h4" gutterBottom>
                Pending KYC Documents
            </Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : kycs.length > 0 ? (
                <DataGrid rows={kycs} columns={columns} pageSize={5} />
            ) : (
                <Typography variant="h6" textAlign="center">
                    No pending KYC records found.
                </Typography>
            )}

            <Dialog open={open} onClose={handleCloseDetails} maxWidth="lg" fullWidth>
                <DialogTitle>KYC Details</DialogTitle>
                <DialogContent>
                    {kycDetails && (
                        <>
                            <Typography variant="h6">User ID: {kycDetails.userId}</Typography>
                            <Typography variant="body1">User: {kycDetails.user}</Typography>
                            <Typography variant="body1">Address: {kycDetails.address}</Typography>
                            <Typography variant="body1">Status: {kycDetails.status}</Typography>
                            <Box mt={2}>
                                <Typography variant="body2">Bill Document:</Typography>
                                {kycDetails.billDocument ? (
                                    <img
                                        src={kycDetails.billDocument}
                                        alt="Bill Document"
                                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Typography>No document available</Typography>
                                )}
                            </Box>
                            <Box mt={2}>
                                <Typography variant="body2">Identity Document:</Typography>
                                {kycDetails.identityDocument ? (
                                    <img
                                        src={kycDetails.identityDocument}
                                        alt="Identity Document"
                                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <Typography>No document available</Typography>
                                )}
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDetails} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PendingKYCs;
