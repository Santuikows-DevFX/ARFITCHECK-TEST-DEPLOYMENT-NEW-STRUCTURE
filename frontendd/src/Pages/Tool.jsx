import React from 'react';
import { Typography, Grid, Box, Button } from '@mui/material';
import Footer from '../Components/Footer.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../Widgets/Navbar.jsx';
import cpImage from '../../public/assets/cp.png'
import downloadGraffitiBG from '../../public/assets/dlGraffiti.png'
import { useSnackbar } from 'notistack';

const APP_URL = 'http://localhost:3000/lax.png';

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

  const { enqueueSnackbar  } = useSnackbar();

  const handleDownload = (APP_URL) => {
    const fileName = APP_URL.split('/').pop();
    const aTag = document.createElement('a');
    aTag.href = APP_URL;
    aTag.setAttribute('download', fileName);
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
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
              maxHeight: 600
            }}
            src={cpImage}
            alt="An external image"
          />
        </Grid>
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            textAlign: { xs: 'center', md: 'left' }, 
            px: { xs: 2, md: 5 }
          }}
        >
          <Box sx={styles.translucentBox} data-aos="fade-right" data-aos-delay="400">
            <Typography sx={{ color: 'black', fontSize: { xs: 15, md: 40 }, fontFamily: "Kanit", fontWeight: "bold" }}>
              Try our
            </Typography>
            <Typography sx={{ color: 'black', fontSize: { xs: 50, md: 75 }, fontFamily: "Kanit", fontWeight: "bold" }}>
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
                  // opacity: !isValid? 0.7 : 1,
                }}
                // onClick={() => handleDownload(APP_URL)}
                onClick={() => handleTemporaryDownload()}
            
              >
                <Typography
                  sx={{
                    fontFamily: "Kanit",
                    fontSize: { xs: 18, md: 20 },
                    padding: 0.5,
                    // visibility: isLogginIn ? "hidden" : "visible",
                  }}
                >
                  DOWNLOAD APK
                </Typography>

                {/* {isLogginIn && (
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
                )} */}
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
