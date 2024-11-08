import React, { useState } from 'react';
import { Typography, Grid, Box, Button, CircularProgress } from '@mui/material';
import Footer from '../Components/Footer.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../Widgets/Navbar.jsx';
import cpImage from '../../public/assets/cp.png'
import cpUpdatedImage from '../../public/assets/cp_updated.png'
import downloadGraffitiBG from '../../public/assets/dlGraffiti.png'
import { useSnackbar } from 'notistack';

const styles = {
  root: {
    backgroundColor: '#ffffff',
    backgroundImage: `url(${downloadGraffitiBG})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  translucentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', 
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
  },
};

function Tool() {

  const [downloadLoading, setDownloadLoading] = useState(false);

  const { enqueueSnackbar  } = useSnackbar();

  const handleDownload = () => {

    setDownloadLoading(true)

    const fileURL = '../apk/arfit_app.apk'
    const link = document.createElement('a');
    link.href = fileURL;
    link.setAttribute('download', 'ARFITCHECK.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadLoading(false)
      enqueueSnackbar(`APK download in progress, check your notification.`, { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        autoHideDuration: 2500,
        style: {
          fontFamily: 'Kanit',
          fontSize: '16px'
        },
        
      });
    }, 1200)
  };

  const handleTemporaryDownload = () => {
    enqueueSnackbar(`Wala pa, wag makulit.`, { 
      variant: 'error',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'right'
      },
      autoHideDuration: 1800,
      style: {
        fontFamily: 'Kanit',
        fontSize: '16px'
      },
      
    });
  }

  return (
    <div style={styles.root}>
      <Navbar />
      <Grid 
        container 
        sx={{ 
          transition: '0.3s', 
          justifyContent: 'center', 
          alignContent:'center',
          alignItems: 'center', 
          backgroundRepeat: 'no-repeat',
          flex: 1, 
          p: { xs: 2, md: 3 },
          pt: { xs: 2, md: 10 },
          mb: "25vh" 
        }}
      >
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            textAlign: 'center', 
            marginBottom: '1.5%', 
            marginTop: { xs: '20%', md: '5%' }
          }}
          data-aos="fade-right" data-aos-delay="200"
        >
          <img
            style={{ 
              objectFit: "contain", 
              width: '100%', 
              maxHeight: 700
            }}
            src={cpUpdatedImage}
            alt="Download App Image"
          />
        </Grid>
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            textAlign: { xs: 'center', md: 'left' }, 
            px: { xs: 2, md: 5 },
            mt: { xs: 2 }
          }}
        >
          <Box sx={styles.translucentBox} data-aos="fade-right" data-aos-delay="400">
            <Typography sx={{ color: 'black', fontSize: { xs: 15, md: 40 }, fontFamily: "Kanit", fontWeight: "bold" }}>
              Try our
            </Typography>
            <Typography sx={{ color: 'black', fontSize: { xs: 40, md: 75 }, fontFamily: "Kanit", fontWeight: "bold" }}>
              ARFITCHECK
            </Typography>
            <Typography sx={{ color: 'black', fontSize: { xs: 12, md: 20 }, fontFamily: "Kanit", fontWeight: "Regular" }}>
              Experience a new way of shopping with <span style={{ fontWeight: 'bold', fontFamily: 'Kanit', textDecoration: 'underline' }}>ARFITCHECK</span>, an innovative application designed to let you virtually try on and customize clothing products from the comfort of your home.
            </Typography>
            <Grid container sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, pt: 2 }}>
              <Grid item data-aos="fade-down" data-aos-delay="700">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: "White",
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
                  opacity: downloadLoading? 0.7 : 1,
                }}
                onClick={() => handleDownload()}
            
              >
                <Typography
                  sx={{
                    fontFamily: "Kanit",
                    fontSize: { xs: 14, md: 18 },
                    padding: 0.5,
                    visibility: downloadLoading ? "hidden" : "visible",
                  }}
                >
                  DOWNLOAD APK
                </Typography>

                {downloadLoading && (
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

export default Tool;
