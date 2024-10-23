import React from 'react';
import Footer from '../Components/Footer';
import { Box, Card, CardContent, CardMedia, Grid, Typography } from '@mui/material';
import Navbar from '../Widgets/Navbar';
import aboutGraffitiBG from '../../public/assets/aboutGraffiti.png';
import shopImage from '../../public/assets/shop.png';

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 60px)',
    padding: '20px',
    backgroundColor: '#ffffff',
    backgroundImage: `url(${aboutGraffitiBG})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  },
  contentBox: {
    borderRadius: '20px',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    height: '500px',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.5)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
    display: 'flex',
    flexDirection: 'column',
    margin: '5px',
  },
  cardMedia: {
    height: '250px',
    width: '100%',
  },
  cardContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',  // Aligns content to the top
    overflowY: 'auto',  // Enable vertical scrolling if content exceeds the height
    padding: '16px',   // Added padding for better spacing
  },
};

function About() {
  return (
    <div>
      <Navbar />
      <Box style={styles.root}>
        <Box style={styles.contentBox} data-aos="zoom-in" data-aos-delay="400">
          <Typography
            sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 50 }, fontWeight: 'bold', color: 'black', textAlign: 'center', textDecoration: 'underline' }}
          >
            ABOUT US
          </Typography>
          <Grid container spacing={4} justifyContent="center" sx={{ marginTop: '20px' }}>
            <Grid item>
              <Card style={styles.card}>
                <CardMedia
                  component="img"
                  image={shopImage}
                  alt="B.MIC"
                  style={styles.cardMedia}
                />
                <CardContent style={styles.cardContent}>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 30 }, fontWeight: 'bold', color: 'black', textAlign: 'center' }}
                  >
                    What is B.MIC?
                  </Typography>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 14, md: 18 }, color: 'black', textAlign: 'justify' }}
                  >
                    B.MIC is a clothing store located in Malabon, selling streetwear clothing styles with unique designs. 
                    For more details, visit <a href="https://www.facebook.com/bmic.clothing" target="_blank" rel="noopener noreferrer">Facebook Page</a>.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card style={styles.card}>
                <CardMedia
                  component="img"
                  image={shopImage}
                  alt="ArfitCheck"
                  style={styles.cardMedia}
                />
                <CardContent style={styles.cardContent}>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 30 }, fontWeight: 'bold', color: 'black', textAlign: 'center' }}
                  >
                    What is ARFITCHECK?
                  </Typography>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 14, md: 16 }, color: 'black', textAlign: 'justify' }}
                  >
                    <b>ARFITCHECK</b> is a system specifically designed for B.MIC. It is a Web-Based clothing ordering system with an Augmented Reality Try-On application, this application serves as tool for users to virtually try-on and customize clothing products, all from the comfort of their homes. The name of the system was derived from the popular term <i>"OUTFIT CHECK"</i>.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item>
              <Card style={styles.card}>
                <CardMedia
                  component="img"
                  image={shopImage}
                  alt="Developers"
                  style={styles.cardMedia}
                />
                <CardContent style={styles.cardContent}>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 30 }, fontWeight: 'bold', color: 'black', textAlign: 'center' }}
                  >
                    Meet the Developers
                  </Typography>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: { xs: 14, md: 18 }, color: 'black', textAlign: 'justify', marginTop: '10px' }}
                  >
                    Jeon Drew Jaime - UI/UX & Graphics Designer<br />
                    Josh Kiel Santuico - Programmer<br />
                    Gian Dale Lim - Programmer<br />
                    Charles Nolasco - Document & Programmer<br />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Footer />
    </div>
  );
}

export default About;
