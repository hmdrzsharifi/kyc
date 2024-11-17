import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box, Slide, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import KycUpload from './pages/KycUpload';
import KycStatus from './pages/KycStatus';
import KYCPendingUsers from './pages/KYCPendingUsers';
import VerifyKYC from './pages/VerifyKyc';
import VideoUpload from "./pages/VideoUpload";

const App = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isAdmin = true;
    const navigate = useNavigate();

    const isAuthPage = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/login';

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <>
            <AppBar position="static" color="primary">
                <Toolbar>
                    {!isAuthPage && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={toggleMenu}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
                        {/* Image next to Logout button */}
                        <img
                            src="/icons8-video-id-verification-50.png"
                            alt="Video Verification"
                            style={{
                                width: '30px', // تنظیم اندازه تصویر
                                height: '30px', // تنظیم اندازه تصویر
                                marginRight: '10px', // فاصله بین تصویر و آیکون
                            }}
                        />

                        <Typography variant="h6" sx={{ textAlign: 'left', paddingLeft: '40px', padding: '10px' }}>
                            KYC Management
                        </Typography>
                    </Box>

                    {/* Red Action Button on the Right */}
                    {!isAuthPage && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <IconButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: '50%', // گرد کردن دکمه
                                    padding: '10px', // تنظیم اندازه دکمه
                                    '&:hover': {
                                        backgroundColor: '#a8aab0', // رنگ دکمه در حالت هاور
                                    },
                                }}
                            >
                                <LogoutIcon sx={{ color: 'white' }} />
                            </IconButton>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Slide menu */}
            <Slide direction="right" in={menuOpen} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '64px', // زیر AppBar قرار می‌گیرد
                        left: 0,
                        width: '250px',
                        height: '100%',
                        backgroundColor: '#fff',
                        boxShadow: '2px 0px 5px rgba(0,0,0,0.2)',
                        zIndex: 999,
                    }}
                >
                    <List>
                        <ListItem button component={Link} to="/kyc-upload" onClick={toggleMenu}>
                            <ListItemIcon>
                                <UploadFileIcon />
                            </ListItemIcon>
                            <ListItemText primary="KYC Upload" />
                        </ListItem>
                        <ListItem button component={Link} to="/video-upload" onClick={toggleMenu}>
                            <ListItemIcon>
                                <UploadFileIcon />
                            </ListItemIcon>
                            <ListItemText primary="Video Upload" />
                        </ListItem>
                        <ListItem button component={Link} to="/kyc-status" onClick={toggleMenu}>
                            <ListItemIcon>
                                <CheckCircleIcon />
                            </ListItemIcon>
                            <ListItemText primary="KYC Status" />
                        </ListItem>

                        {isAdmin && (
                            <ListItem button component={Link} to="/admin/kyc-pending" onClick={toggleMenu}>
                                <ListItemIcon>
                                    <AdminPanelSettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Admin - Pending KYC" />
                            </ListItem>
                        )}
                    </List>
                </Box>
            </Slide>

            <Routes>
                <Route path="/" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/kyc-upload" element={<KycUpload />} />
                <Route path="/kyc-status" element={<KycStatus />} />
                <Route path="/video-upload" element={<VideoUpload />} />
                <Route path="/admin/kyc-pending" element={<KYCPendingUsers />} />
                <Route path="/admin/verify/:userId" element={<VerifyKYC />} />
            </Routes>
        </>
    );
};

export default App;
