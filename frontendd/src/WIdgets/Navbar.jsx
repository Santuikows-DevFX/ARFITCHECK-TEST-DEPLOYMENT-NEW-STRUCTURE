import * as React from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Collapse, Avatar, Stack, Badge, useMediaQuery, useTheme, IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useStateContext } from '../ContextAPI/ContextAPI';
import axiosClient from '../axios-client';
import Swal from 'sweetalert2';
import { useCart } from '../ContextAPI/CartProvider';
import logo from '../../public/assets/Logo.jpg'

function Navbar() {
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [cookie, removeCookie, remove, setCookie] = useCookies(['?sessiontoken', '?id']);
  const [showLogout, setShowLogout] = React.useState(false);
  const { setToken, setUserID, setRole } = useStateContext();
  const [expanded, setExpanded] = React.useState(false);
  const [user, setUser] = React.useState([]);
  const { cartItemCount } = useCart();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  
  const navigator = useNavigate();

  React.useEffect(() => {
    checkID();
  }, []);

  const checkID = async () => { 
    try {
      const fetchCurrentUser = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      if (fetchCurrentUser.data) {
        setUser(fetchCurrentUser.data);
      }
    } catch (error) {
      console.log(error);
    }

    if (localStorage.getItem('?sessiontoken') == null || !cookie['?sessiontoken']) {
      setShowLogout(false);
    } else {
      setShowLogout(true);
    }
  };

  const handleMenuToggle = () => {
    setExpanded(!expanded);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
        <ListItemText 
    primary="Home" 
    primaryTypographyProps={{ 
      sx: { fontFamily: 'YourCustomFont, sans-serif', fontSize: '1rem' }
    }} 
  />
        </ListItem>
        <ListItem button component={Link} to="/shop">
          <ListItemText primary="Shop" />
        </ListItem>
        <ListItem button component={Link} to="/tool">
          <ListItemText primary="ARFIT App" />
        </ListItem>
        <ListItem button component={Link} to="/about">
          <ListItemText primary="About" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      {showLogout ? (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="fixed" sx={{ backgroundColor: "#F4F4F4", color: "black" }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
            <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
                  <MenuIcon />
                </IconButton>
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 35, sm: 40, md: 50 },
                }}
              />
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                <Button color="inherit" sx={{ paddingX: 4, paddingY: 2 }} component={Link} to="/">
                  <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 12, md: 20 } }}>Home</Typography>
                </Button>
                <Button color="inherit" sx={{ paddingX: 4, paddingY: 2 }} component={Link} to="/shop">
                  <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 12, md: 20 } }}>Shop</Typography>
                </Button>
                <Button color="inherit" sx={{ paddingX: 4, paddingY: 2 }} component={Link} to="/tool">
                  <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 12, md: 20 } }}>ARFIT App</Typography>
                </Button>
                <Button color="inherit" sx={{ paddingX: 4, paddingY: 2 }} component={Link} to="/about">
                  <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 12, md: 20 } }}>About</Typography>
                </Button>
                <Button color="inherit" sx={{ paddingX: 4, paddingY: 2 }} component={Link} to="/cart">
                  <Badge badgeContent={cartItemCount} color="error">
                    <Avatar sx={{ backgroundColor: 'transparent', color: 'black', width: 30, height: 30 }}>
                      <ShoppingCartIcon fontSize='small' />
                    </Avatar>
                  </Badge>
                </Button>
                <Box sx={{ position: 'relative' }}>
                  <Button
                    color="inherit"
                    sx={{ paddingX: 2, paddingY: 2 }}
                    onClick={handleMenuToggle}
                  >
                    <Avatar sx={{ backgroundColor: 'transparent', color: 'black', width: 33, height: 33 }}>
                      <PersonIcon fontSize='medium' />
                    </Avatar>
                  </Button>
                  <Collapse
                    in={expanded}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      zIndex: 1,
                      width: 'max-content',
               
                    }}
                  >
                    <Stack
                      direction="column"
                      spacing={1}
                      sx={{ backgroundColor: '#F4F4F4', p: 1, borderRadius: 1 }}
                    >
                      <Button color="inherit" component={Link} to="/profile">
                        <Typography sx={{ fontFamily: "Kanit", fontSize: 15 }}>Dashboard</Typography>
                      </Button>
                      <Button
                        color="inherit"
                        onClick={() => {
                          Swal.fire({
                            title: "Are you sure you want to logout?",
                            text: "",
                            icon: "question",
                            showCancelButton: true,
                            cancelButtonText: 'No',
                            confirmButtonColor: '#414a4c',
                            confirmButtonText: "Yes",
                            customClass: {
                              container: 'sweet-alert-container',
                            },
                            didOpen: () => {
                              document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
                            }
                          }).then((result) => {
                            if (result.isConfirmed) {


                              setToken(null)
                              setRole(null)
                              setUserID(null)

                              navigator('/login')

                            }
                          });
                        }}
                      >
                        <Typography sx={{ fontFamily: "Kanit", fontSize: 15 }}>Logout</Typography>
                      </Button>
                    </Stack>
                  </Collapse>
                </Box>
              </Box>
              <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
          
                  <IconButton badgeContent={cartItemCount}  component={Link} to="/cart">
                      <ShoppingCartIcon   sx={{ backgroundColor: 'transparent', color: 'black' }}fontSize='small' />
                  </IconButton>
        
           
                  <IconButton onClick={handleMenuToggle}>
                  
                    <PersonIcon fontSize='medium' sx={{ backgroundColor: 'transparent', color: 'black' }} />
                
                  </IconButton>
             
                <Collapse
                  in={expanded}
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1,
                    width: 'max-content',
                    minWidth: '20%',
                  }}
                >
                  <Stack
                    direction="column"
                    spacing={1}
                    sx={{ backgroundColor: '#F4F4F4', p: 1, borderRadius: 1 }}
                  >
                    <Button color="inherit" component={Link} to="/profile">
                      <Typography sx={{ fontFamily: "Kanit", fontSize: 15 }}>Dashboard</Typography>
                    </Button>
                    <Button
                      color="inherit"
                      onClick={() => {
                        Swal.fire({
                          title: "Are you sure you want to logout?",
                          text: "",
                          icon: "question",
                          showCancelButton: true,
                          cancelButtonText: 'No',
                          confirmButtonColor: '#414a4c',
                          confirmButtonText: "Yes",
                          customClass: {
                            container: 'sweet-alert-container',
                          },
                          didOpen: () => {
                            document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
                          }
                        }).then((result) => {
                          if (result.isConfirmed) {

                            setToken(null)
                            setRole(null)
                            setUserID(null)

                            navigator('/login')

                          }
                        });
                      }}
                    >
                      <Typography sx={{ fontFamily: "Kanit", fontSize: 15 }}>Logout</Typography>
                    </Button>
                  </Stack>
                </Collapse>
              </Box>
            </Toolbar>
          </AppBar>
          <Drawer
            anchor="left" 
            open={drawerOpen}
            onClose={toggleDrawer(false)}
          >
            {drawer}
          </Drawer>
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="fixed" sx={{ pl: { xs: 0, md: 5 }, pr: { xs: 2, md: 5 }, backgroundColor: "#F4F4F4", color: "black" }}>
            <Toolbar>
              
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                
                <Box
                  component="img"
                  src={logo}
                  alt="Logo"
                  sx={{
                    width: { xs: 80, sm: 100, md: 120 },
                    height: { xs: 35, sm: 40, md: 50 },
                  }}
                />
              </Typography>
            </Toolbar>
          </AppBar>
        </Box>
      )}
    </div>
  );
}

export default Navbar;