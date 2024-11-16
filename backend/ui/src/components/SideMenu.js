import React from 'react';
import { Drawer, List, ListItem, ListItemText } from '@mui/material';

const SideMenu = () => {
    return (
        <Drawer variant="permanent" anchor="left">
            <List>
                <ListItem button>
                    <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem button>
                    <ListItemText primary="KYC Upload" />
                </ListItem>
                <ListItem button>
                    <ListItemText primary="KYC Status" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default SideMenu;
