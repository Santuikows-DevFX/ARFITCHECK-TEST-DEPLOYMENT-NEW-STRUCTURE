import React from 'react';
import { Grid, Typography, TextField, Button, ThemeProvider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import { createTheme } from '@mui/material/styles';
import Logo from '../../public/assets/Logo.jpg'

const theme = createTheme();

const Footer = () => {
  return (
    <div>
      <ThemeProvider theme={theme}>
        <div style={{ backgroundColor: '#212930', padding: '20px', color: 'white' }}>
          <Grid container spacing={2} sx={{ padding: { xs: 2, md: 2 } }}>
            {/* Logo */}
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <img
                src={Logo}
                style={{ width: '100%', maxWidth: '30%', height: 'auto' }}
                alt="Logo"
              />
            </Grid>
            
            {/* Contacts */}
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Inter', fontWeight: 'bold' }}>
                Contacts
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Inter' }}>
                <p>Address: 13 Celia St, Malabon, Philippines</p>
                <p>Phone: +09052470314</p>
                <p>Email: bmicclothes@gmail.com</p>
              </Typography>
            </Grid>
            
            {/* Links */}
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Inter', fontWeight: 'bold' }}>
                Links
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Inter' }}>
                <a
                  href="https://www.facebook.com/bmic.clothing"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <FacebookIcon sx={{ fontSize: { xs: 10, md: 20 } }} /> BMIC Clothing
                </a>
              </Typography>
            </Grid>
            
            {/* Privacy & Policy */}
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Inter', fontWeight: 'bold' }}>
                Privacy & Policy
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Inter' }}>
                <a
                  href="#"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>
              </Typography>
              <div style={{ marginTop: '20px' }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={8}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    placeholder="Enter your email"
                    InputProps={{
                      sx: {
                        textAlign: 'center', 
                        fontFamily: 'Kanit',
                      },
                    }}
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '4px', 
                      height: '40px',
                      fontFamily: 'Kanit', 
                    }}
                  />
                  </Grid>
                  <Grid item xs={4}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      sx={{
                        backgroundColor: "White",
                        border: '1px solid #fff',
                        "&:hover": {
                          backgroundColor: "#414a4c",
                          color: "white",
                        },
                        "&:not(:hover)": {
                          backgroundColor: "#3d4242",
                          color: "white",
                        },
                        background:
                          "linear-gradient(to right, #414141, #000000)",
                        height: '40px'
                      }}
                    >
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Footer;
