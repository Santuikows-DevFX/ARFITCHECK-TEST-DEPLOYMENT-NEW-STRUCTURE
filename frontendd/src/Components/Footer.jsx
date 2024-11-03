import React from 'react';
import { Grid, Typography, TextField, Button, ThemeProvider } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

import { createTheme } from '@mui/material/styles';
import Logo from '../../public/assets/Logo.jpg'
import TermsAndConditions from '../Pages/TermsAndConditions';
import { useState } from 'react';

const theme = createTheme();

const Footer = () => {

  const [termsAndConditionDialogOpen, setTermsnAndConditionDialog] = useState(false)

  //terms and condition dialog
  const handleTermsAndCondiDialogOpen = () => {
    setTermsnAndConditionDialog(true)
  }

  const handleTermsAndCondiDialogClose = () => {
    setTermsnAndConditionDialog(false)
  }

  const handleAgree = () => {
    setTermsnAndConditionDialog(false);
  };

  return (
    <div>
      <ThemeProvider theme={theme}>
        <div style={{ backgroundColor: '#212930', padding: '20px', color: 'white' }}>
          <Grid container spacing={2} sx={{ padding: { xs: 2, md: 2 } }}>
            {/* Logo */}
            <Grid item xs={12} md={2.4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <img
                src={Logo}
                style={{ width: '100%', maxWidth: '30%', height: 'auto' }}
                alt="Logo"
              />
            </Grid>
            
            {/* Contacts */}
            <Grid item xs={12} md={2.4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Kanit', fontWeight: 'bold' }}>
                Contact Us
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Kanit' }}>
                <p>
                  <LocationOnIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: { xs: 15, md: 20 } }} /> 
                  12 Gov. Pascual Ave. Cor. Maria Clara St.,<br />Malabon, Philippines
                </p>
                <p>
                  <PhoneIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: { xs: 15, md: 20 } }} /> 
                  +09052470314
                </p>
                <p>
                  <EmailIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: { xs: 15, md: 20 } }} /> 
                  bmicclothes@gmail.com
                </p>
              </Typography>
            </Grid>
            {/* Links */}
            <Grid item xs={12} md={2.4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Kanit', fontWeight: 'bold' }}>
                Follow Us
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Kanit', cursor: 'pointer' }}>
                <a
                  href="https://www.facebook.com/bmic.clothing"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <FacebookIcon sx={{ fontSize: { xs: 15, md: 20 } }} /> Facebook
                </a>
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Kanit', cursor: 'pointer', mt: 0.8 }}>
                <a
                  href="https://www.instagram.com/bmic_clothing/"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  target="_blank" rel="noopener noreferrer"
                >
                  <InstagramIcon sx={{ fontSize: { xs: 15, md: 20 } }} /> Instagram
                </a>
              </Typography>
            </Grid>
            {/* Privacy & Policy */}
            <Grid item xs={12} md={2.4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography sx={{ fontSize: { xs: 12, md: 15 }, fontFamily: 'Kanit', fontWeight: 'bold' }}>
                Terms & Condition
              </Typography>
              <Typography sx={{ fontSize: { xs: 8, md: 12 }, fontFamily: 'Kanit', textDecoration: 'underline', cursor: 'pointer' }} onClick = {handleTermsAndCondiDialogOpen}>
                Terms and Conditions
              </Typography>
            </Grid>

            <Grid item xs={12} md={2.4} sx={{ textAlign: { xs: 'center' } }}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sx={{ textAlign: {xs: 'center', md: 'left'} }}>
                  <Typography 
                    variant="h6" 
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 14, md: 15 },
                      fontWeight: 'bold',
                      color: 'white',
                      textAlign: {xs: 'center', md: 'left'},
                    }}
                  >
                    Newsletter
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ textAlign: {xs: 'center', md: 'left'} }}>
                  <Typography 
                    variant="body2" 
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 10, md: 11 },
                      color: 'white',
                      textAlign: {xs: 'center', md: 'left'},
                    }}
                  >
                    Get in Touch with us!
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    fullWidth
                    size="small"
                    placeholder="Enter your email"
                    InputProps={{
                      sx: {
                        fontSize: { xs: 10, md: 15 },
                        textAlign: 'center', 
                        fontFamily: 'Kanit',
                      },
                    }}
                    sx={{ 
                      backgroundColor: '#fff', 
                      borderRadius: '4px', 
                      fontFamily: 'Kanit', 
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{
                      fontSize: { xs: 13, md: 15 },
                      backgroundColor: "White",
                      border: '0.5px solid #fff',
                      fontFamily: 'Kanit', 
                      "&:hover": {
                        backgroundColor: "#414a4c",
                        color: "white",
                      },
                      "&:not(:hover)": {
                        backgroundColor: "#3d4242",
                        color: "white",
                      },
                      background: "linear-gradient(to right, #414141, #000000)",
                      height: '40px',
                    }}
                  >
                    Subscribe
                  </Button>
                </Grid>
              </Grid>
           </Grid>
          </Grid>
        </div>
        <TermsAndConditions open={termsAndConditionDialogOpen} onClose={handleTermsAndCondiDialogClose} onAgree={handleAgree}/>
      </ThemeProvider>
    </div>
  );
};

export default Footer;
