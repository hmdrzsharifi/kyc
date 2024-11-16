import React from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography } from '@mui/material';

const AppBar = () => {
    return (
        <MuiAppBar position="static">
            <Toolbar>
                <Typography variant="h6">
                    KYC Management System
                </Typography>
            </Toolbar>
        </MuiAppBar>
    );
};

export default AppBar;
