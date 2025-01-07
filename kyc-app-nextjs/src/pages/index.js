import React, {useEffect, useRef, useState} from 'react';
import Layout from '../Layout';
import Link from 'next/link';
import { useKeycloak } from '@/pages/auth/provider/KeycloakProvider';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { Email, Person } from '@mui/icons-material';
import {getToken} from "@/pages/auth/config/keycloak";
import axios from "axios";

const IndexPage = () => {
    const { logout, user } = useKeycloak();
    const [userLevel, setUserLevel] = useState(null);
    const [token, setToken] = useState(null);
    const tokenIntervalRef = useRef(null); // ذخیره شناسه تایمر برای توکن
    const userLevelIntervalRef = useRef(null); // ذخیره شناسه تایمر برای سطح کاربر

    // useEffect برای دریافت توکن هر 2 ثانیه
    useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getToken(); // دریافت توکن
                setToken(token); // ذخیره توکن در state
                console.log({ token });
            } catch (error) {
                console.error('Error fetching token:', error);
            }
        };

        fetchToken(); // برای اولین بار اجرا می‌شود
        tokenIntervalRef.current = setInterval(fetchToken, 2000); // هر 2 ثانیه اجرا می‌شود

        // پاکسازی setInterval هنگام unmount شدن کامپوننت
        return () => clearInterval(tokenIntervalRef.current);
    }, []); // این useEffect فقط یک بار اجرا می‌شود

    // useEffect برای ارسال درخواست دریافت سطح کاربر هر 5 ثانیه
    useEffect(() => {
        const fetchUserLevel = async () => {
            if (token) { // چک می‌کنیم که توکن موجود باشد
                try {
                    const response = await axios.get("http://172.31.13.30:5000/api/kyc/getUserLevel", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUserLevel(response.data.level); // ذخیره سطح کاربر
                    // وقتی توکن داریم، دیگر نیازی به ارسال درخواست بیشتر نیست
                    clearInterval(userLevelIntervalRef.current); // لغو setInterval برای درخواست سطح کاربر
                    clearInterval(tokenIntervalRef.current); // لغو setInterval برای دریافت توکن
                } catch (error) {
                    console.error('Error fetching user level:', error);
                }
            }
        };

        fetchUserLevel(); // برای اولین بار اجرا می‌شود
        userLevelIntervalRef.current = setInterval(fetchUserLevel, 5000); // هر 5 ثانیه اجرا می‌شود

        // پاکسازی setInterval هنگام unmount شدن کامپوننت
        return () => clearInterval(userLevelIntervalRef.current);
    }, [token]); // این useEffect زمانی اجرا می‌شود که توکن تغییر کند

    return (
        <Layout>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Welcome to the KYC Management System</h1>

            {user && (
                <Box display="flex" justifyContent="center" alignItems="center" marginTop="20px">
                    <Card sx={{ maxWidth: 345, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {/* Center Avatar */}
                            <Avatar
                                src="/icons8-video-id-verification-50.png"
                                sx={{ width: 50, height: 50, marginBottom: 2 }}
                            />
                            <Typography variant="h6" gutterBottom>
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <Person sx={{ marginRight: 1 }} />
                                {user?.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                                <Email sx={{ marginRight: 1 }} />
                                {user?.email}
                            </Typography>

                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                                <Email sx={{ marginRight: 1 }} />
                                {user?.sub}
                            </Typography>
                            {userLevel !== null && (
                                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', marginTop: 1 }}>
                                    <strong>Level:</strong> {userLevel}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Layout>
    );
};

export default IndexPage;
