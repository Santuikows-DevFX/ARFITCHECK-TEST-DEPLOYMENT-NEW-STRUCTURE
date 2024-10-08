import React from 'react';
import { Typography, Grid } from '@mui/material';
import Footer from '../Components/Footer.jsx';
import { FilledButton } from '../Components/UI/Buttons.jsx';
import AOS from 'aos';
import 'aos/dist/aos.css'
import Navbar from '../Widgets/Navbar.jsx';

const APP_URL = 'http://localhost:3000/lax.png'
const styles = {
  root: {
    backgroundColor: '#ffffff',
    backgroundImage: 'url(../public/assets/dlGraffiti.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
};

function Tool() {
  const handleDownload = (APP_URL) => {
    const fileName = APP_URL.split('/').pop();
    const aTag = document.createElement('a');
    aTag.href = APP_URL;
    aTag.setAttribute('download', fileName);
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
  };

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
          pt: { xs: 2, md: 10},
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
            src='..\public\assets\cp.png'
            alt="An external image"
          />
        </Grid>
        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            textAlign: { xs: 'center', md: 'left' }, 
            px: { xs: 2, md: 5 }, 
          
          }}
        >
          <Typography sx={{ color: 'black', fontSize: { xs: 15, md: 50 }, fontFamily: "Kanit", fontWeight: "bold" }}  data-aos="fade-right" data-aos-delay="400">
            Try our
          </Typography>
          <Typography sx={{ color: 'black', fontSize: { xs: 50, md: 80 }, fontFamily: "Kanit", fontWeight: "bold" }} data-aos="fade-right" data-aos-delay="500">
            ARFITCHECK
          </Typography>
          <Typography sx={{ color: 'black', fontSize: { xs: 12, md: 20 }, fontFamily: "Inter", fontWeight: "Regular" }} data-aos="fade-right" data-aos-delay="600">
            Experience a new way of shopping with <span style={{ fontWeight: 'bold', fontFamily: 'Kanit', textDecoration: 'underline' }}>ARFITCHECK</span>, an innovative application designed to let you virtually try on and customize clothing products from the comfort of your home.
          </Typography>
          <Grid container sx={{ justifyContent: { xs: 'center', md: 'flex-start' }, pt: 2 }}>
            <Grid item data-aos="fade-down" data-aos-delay="700">
              <FilledButton onClick={()=>{handleDownload(APP_URL)}} >DOWNLOAD APK</FilledButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Footer />
    </div>
  );
}

export default Tool;