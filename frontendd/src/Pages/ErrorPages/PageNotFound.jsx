import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        textAlign: 'center',
        color: 'black',
        padding: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: { xs: 300, md: 600 }, mx: 'auto' }}>
        <Typography
          variant="h1"
          sx={{
            fontFamily: 'Kanit',
            fontSize: { xs: 100, md: 200, lg: 250 },
            fontWeight: 'bold',
            lineHeight: 1,
          }}
        >
          404
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'Kanit',
            mb: { xs: 2, md: 4 },
            fontSize: { xs: 16, md: 20 },
          }}
        >
          It looks like you're lost, going through this page is a mystery...
          <br />
          But don't worry, we'll help you find your way back.
          <br />
          Let's get you back on track and explore what you were looking for.
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
              fontSize: { xs: 18, md: 25 },
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

export default PageNotFound;
