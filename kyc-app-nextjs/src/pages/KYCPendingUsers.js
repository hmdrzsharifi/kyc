import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Button, CircularProgress, Alert
} from '@mui/material';
import Layout from "@/Layout";
import DocumentDetailsPopup from "./DocumentDetailsPopup"; // مسیر درست فایل را مشخص کنید.

const KYCPendingUsers = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // برای ذخیره جزئیات کاربر انتخاب‌شده
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [popupOpen, setPopupOpen] = useState(false); // برای مدیریت باز و بسته شدن پاپ‌آپ
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchPendingUsers = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get('http://172.31.13.30:5000/api/admin/kyc-pending', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch pending users: ' + err.message);
                setLoading(false);
                console.error(err);
            }
        };

        fetchPendingUsers();
    }, []);

    const handleVerify = (userId) => {
        router.push(`/admin/verify/${userId}`);
    };

    const handleViewDetails = async (user) => {
        setSelectedUser(user);

        console.log({ selectedUser });

        const token = localStorage.getItem('token');
        try {
            const response = await axios.post(
                'http://172.31.13.30:5000/api/admin/kyc-documents',
                { userId: user._id }, // ارسال userId در بدنه درخواست
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log({ response });
            setSelectedDocument(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch user Document: ' + err.message);
            setLoading(false);
            console.error(err);
        }

        setPopupOpen(true); // پاپ‌آپ را باز می‌کنیم
    };


    const handleClosePopup = () => {
            setSelectedUser(null);
            setSelectedDocument(null)
            setPopupOpen(false); // پاپ‌آپ را می‌بندیم
        };

        return (
            <Layout>
                <Container maxWidth="lg" sx={{mt: 4}}>
                    <Typography variant="h4" gutterBottom>
                        KYC Pending Users
                    </Typography>

                    {loading && <CircularProgress/>}

                    {error && <Alert severity="error">{error}</Alert>}

                    {!loading && users.length === 0 && (
                        <Typography variant="body1">No users awaiting KYC verification.</Typography>
                    )}

                    {!loading && users.length > 0 && (
                        <TableContainer component={Paper} sx={{mt: 2}}>
                            <Table aria-label="kyc pending users">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user._id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.kyc_status}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleVerify(user._id)}
                                                    sx={{mr: 1}}
                                                >
                                                    Verify
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="info"
                                                    onClick={() => handleViewDetails(user)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* نمایش پاپ‌آپ جزئیات کاربر */}
                    <DocumentDetailsPopup
                        open={popupOpen}
                        onClose={handleClosePopup}
                        document={selectedDocument} // ارسال اطلاعات کاربر انتخاب‌شده به پاپ‌آپ
                    />
                </Container>
            </Layout>
        );
    };

export default KYCPendingUsers;
