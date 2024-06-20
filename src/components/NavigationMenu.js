import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications'; // Importing icon for Config Generator
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const NavigationMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false); // Close the drawer upon navigation
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            size="large">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">
            PDF to JSON Converter
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
      <ListItem button component={RouterLink} to="/config-generator" onClick={() => handleNavigation('/config-generator')}>
            <ListItemIcon>
              <SettingsApplicationsIcon />
            </ListItemIcon>
            <ListItemText primary="Config Generator" />
          </ListItem>
        <List>
          <ListItem button component={RouterLink} to="/pdf-upload" onClick={() => handleNavigation('/pdf-upload')}>
            <ListItemIcon>
              <UploadFileIcon />
            </ListItemIcon>
            <ListItemText primary="PDF Upload" />
          </ListItem>
          <ListItem button component={RouterLink} to="/json-viewer" onClick={() => handleNavigation('/json-viewer')}>
            <ListItemIcon>
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText primary="JSON Viewer" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default NavigationMenu;