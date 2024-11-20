import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, Drawer, List, ListItem, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from 'react-toastify';

const Layout = ({ children }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const router = useRouter();

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        toast.error('Logout', {  // نمایش پیام با رنگ قرمز
            autoClose: 3000,  // بعد از ۳ ثانیه پیام بسته می‌شود
        });
        router.push('/login').then(r => {

        });
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* AppBar (نوار بالایی) */}
            <AppBar position="fixed" sx={{ zIndex: 1201}} style={{backgroundColor:'#42568d'}}>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        KYC Management
                    </Typography>
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
                </Toolbar>
            </AppBar>

            {/* Drawer (سایدبار) */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                sx={{
                    width: 250,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 250,
                        boxSizing: 'border-box',
                        zIndex: 1200, // Drawer باید زیر AppBar باشد
                    },
                }}
            >
                <List>
                    <ListItem button component={Link} href="/">
                        <HomeIcon />
                        <ListItemText primary="Home" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} href="/kyc-upload">
                        <UploadFileIcon />
                        <ListItemText primary="KYC Upload" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} href="/VideoUpload">
                        <UploadFileIcon />
                        <ListItemText primary="Video Upload" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} href="/KycStatus">
                        <CheckCircleIcon />
                        <ListItemText primary="KYC Status" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} href="/KYCPendingUsers">
                        <AdminPanelSettingsIcon />
                        <ListItemText primary="Admin - Pending KYC" />
                    </ListItem>
                    <Divider />
                    <ListItem button component={Link} href="/contact">
                        <ContactMailIcon />
                        <ListItemText primary="Contact" />
                    </ListItem>
                    <Divider />
                </List>
            </Drawer>

            {/* محتوا */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 3,
                    marginTop: '64px', // This ensures content is below the AppBar
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
