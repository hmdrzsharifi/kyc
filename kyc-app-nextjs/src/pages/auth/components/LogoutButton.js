import React from 'react';
import { useKeycloak } from '../provider/KeycloakProvider';
import { Box, IconButton, Tooltip } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutButton = () => {
    const { logout } = useKeycloak();

    return (
        <div className="relative inline-block text-left">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title="Logout" arrow>
                    <IconButton
                        onClick={logout}
                        sx={{
                            '&:hover': {
                                backgroundColor: '#7392b6', // Hover effect color
                            },
                        }}
                    >
                        <LogoutIcon sx={{ color: 'white' }} />
                    </IconButton>
                </Tooltip>
            </Box>
        </div>
    );
};

export default LogoutButton;
