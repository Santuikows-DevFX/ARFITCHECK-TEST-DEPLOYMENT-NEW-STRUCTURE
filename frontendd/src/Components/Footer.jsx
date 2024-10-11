import React from 'react';
import { Grid, Typography, ThemeProvider } from '@mui/material';
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
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <img
                src={Logo}
                style={{ width: '100%', maxWidth: '30%', height: 'auto' }}
                alt="Logo"
              />
            </Grid>
            <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
             <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Inter', fontWeight: 'bold' }}>
                Contacts
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Inter' }}>
                <p>Address: 13 Celia St,  Malabon, Philippines</p>
                <p>Phone: +09052470314</p>
                <p>Email: bmicclothes@gmail.com</p>
              </Typography>
            </Grid>
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
            </Grid>
          </Grid>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default Footer;
