import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Button, Avatar, Menu, MenuItem, Box, Skeleton, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { deepOrange } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from "firebase/firestore";
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const drawerWidth = 240;

const Appbar = ({ open, handleDrawerOpen, handleItemClick }) => { 
  const [avatarMenuAnchorEl, setAvatarMenuAnchorEl] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setIsLoggedIn(!!user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAvatarMenuOpen = (event) => {
    setAvatarMenuAnchorEl(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarMenuAnchorEl(null);
  };

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const [userDetails, setUserDetails] = useState(null);
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user);

      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserDetails(docSnap.data());
        console.log(docSnap.data());
      } else {
        console.log("User is not logged in");
      }
    });
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Box sx={{ display: 'flex', }}>
      <StyledAppBar position="fixed" open={open} sx = {{backgroundColor: '#033564'}}>
        <Toolbar sx={{ backgroundColor: '#033564', marginX: isLoggedIn ? 0 : 15  }}>
          {isLoggedIn && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flexGrow: 1 }}>
            <img src="/src/assets/Sti_Logo.png" alt="Group-4" border="0" height={50} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isLoggedIn ? (
              <>
                <Button component={Link} to="/" color="inherit">
                  Home
                </Button>
                <Button component={Link} to="/login" color="inherit">
                  Login
                </Button>
                <Button component={Link} to="/signup" color="inherit">
                  Enroll Now
                </Button>
              </>
            ) : (
              <>
                <IconButton onClick={handleAvatarMenuOpen} sx={{ p: 0 }}>
                  {userDetails ? (
                    <>
                      <Avatar src={userDetails.photo}></Avatar>
                    </>
                  ) : (
                    <Skeleton variant="circular" width={40} height={40} />
                  )}
                </IconButton>
                <Menu
                  anchorEl={avatarMenuAnchorEl}
                  open={Boolean(avatarMenuAnchorEl)}
                  onClose={handleAvatarMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 5,
                      '& .MuiMenuItem-root': {
                        display: 'flex',
                        alignItems: 'center',
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  {['View Profile'].map((text, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => handleItemClick(text)} // Use handleItemClick
                    >
                      <ListItemIcon>
                        {index === 0 && <AccountCircleIcon sx={{ mr: 1 }} />}
                      </ListItemIcon>
                      <ListItemText primary={text} />
                    </MenuItem>
                  ))}
                                    <MenuItem onClick={() => { handleLogout(); handleAvatarMenuClose(); }}>
                    <LogoutIcon sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>

                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </StyledAppBar>
    </Box>
  );
}

export default Appbar;