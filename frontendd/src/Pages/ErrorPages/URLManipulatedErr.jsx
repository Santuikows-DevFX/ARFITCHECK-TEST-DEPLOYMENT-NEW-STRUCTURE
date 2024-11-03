import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import shopGraffitiBG from '../../../public/assets/shopGraffiti1.png'
import { replace } from 'formik';

const URLManipulated = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${shopGraffitiBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
        color: 'black',
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box
        sx={{
          margin: { xs: 2, md: 4 }, 
          padding: { xs: 2, md: 4 }, 
          maxWidth: { xs: 320, sm: 480, md: 600, lg: 800 },  
          textAlign: 'center', 
          backgroundColor: 'rgba(255, 255, 255, 0.8)',  
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h1"
          sx={{ 
            fontFamily: 'Kanit', 
            fontSize: { xs: 20, sm: 30, md: 50 },  
            fontWeight: 'bold',
            mb: { xs: 2, md: 4 },  
          }}
        >
          SOMETHING WENT WRONG
        </Typography>
        <Typography
          variant="h6"
          sx={{ 
            fontFamily: 'Kanit', 
          
            fontSize: { xs: 10, sm: 15, md: 20 }, 
            lineHeight: 1.5, 
          }}
        >
          Something went wrong while generating the image URL. This may occur if multiple requests are sent in quick succession or if you are trying to change the URL <b>manually</b>. To resolve this, please follow these steps:
          <br /><br />
          1. <strong>Return to the Home Page:</strong><br /> Press the <strong>GO HOME</strong> button below to exit the current session and navigate back to the website homepage.<br />
          <br />
          2. <strong>Retry the Request:</strong><br /> Once back on the homepage, please attempt to send your request from mobile again.
          <br /><br />
        </Typography>

        <Button
          fullWidth
          onClick={() => navigate('/home', {replace: true})}
          variant="contained"
          sx={{
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
            background: 'linear-gradient(to right, #414141, #000000)',
            mt: { xs: 2, md: 3 },
            py: { xs: 1, md: 1.5 }, 
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 10, md: 15 }, 
      
              color: 'white',
            }}
          >
            GO HOME
          </Typography>
        </Button>
      </Box>
    </Box>
  );
};

export default URLManipulated;
