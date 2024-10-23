import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import shopGraffitiBG from '../../../public/assets/shopGraffiti1.png'

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
      }}
    >
      <Box
        sx={{
          margin: { xs: 2, md: 4 }, 
          padding: { xs: 2, md: 4 }, 
          textAlign: 'center', 
        }}
      >
        <Typography
          variant="h1"
          sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 80 }, fontWeight: 'bold' }}
        >
          SOMETHING WENT WRONG
        </Typography>
        <Typography
          variant="h6"
          sx={{ fontFamily: 'Kanit', mb: 4, fontSize: { xs: 16, md: 25 } }}
        >
          Something went wrong while generating the image URL. This may occur if multiple requests are sent in quick succession or if you're trying to change the URL <b>manually</b>. To resolve this, please follow these steps:
          <br /><br />
          1. <strong>Return to the Home Page:</strong> Press the <strong>GO HOME</strong> button below to exit the current session and navigate back to the website homepage.
          <br />
          2. <strong>Retry the Request:</strong> Once back on the homepage, please attempt to send your request from mobile again.
          <br /><br />
        </Typography>

        <Button
          fullWidth
          onClick={() => navigate('/home')}
          variant="contained"
          sx={{
            backgroundColor: 'white',
            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
            background: 'linear-gradient(to right, #414141, #000000)',
            mt: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 14, md: 20 },
              padding: 0.5,
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
