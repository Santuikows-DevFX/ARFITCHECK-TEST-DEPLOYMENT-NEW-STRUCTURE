import React from 'react';
import Footer from '../Components/Footer';
import { Box, Typography } from '@mui/material';
import Navbar from '../Widgets/Navbar';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)', 
    padding: '20px',
    backgroundColor: '#ffffff',
    backgroundImage: 'url(../public/assets/aboutGraffiti.png)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  contentBox: {
    borderRadius: '20px',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: '100%',
    maxWidth: '95%', 
    padding: '20px',
  },
};

function About() {
  return (
    <div>
      <Navbar />
      <Box style={styles.root}>
        <Box style={styles.contentBox} data-aos="zoom-in" data-aos-delay="400">
          <img
            src="./public/assets/shop.png"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }}
          />
          <Typography
            sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 34 }, fontWeight: 'bold', color: 'black', textAlign: 'center'}}
          >
            ABOUT B.MIC
          </Typography>
    
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 12, md: 20 },
              fontWeight: 'light',
              color: 'black',
              textAlign: 'justify',
              textIndent: '2em',
            
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo 
          </Typography>
        </Box>
      </Box>
      <Footer />
    </div>
  );
}

export default About;