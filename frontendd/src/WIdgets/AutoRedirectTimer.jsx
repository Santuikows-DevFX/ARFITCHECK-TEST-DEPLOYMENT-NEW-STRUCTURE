import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const AutoRedirectTimer = ({ email }) => {
  const [seconds, setSeconds] = useState(5);

  const navigator = useNavigate();

  useEffect(() => {

    if (seconds > 0) {
      const timerId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
      return () => clearInterval(timerId);

    } else {
        
        navigator('/login', { replace: true });        
    }
  }, [seconds]);

  return (
    <>
        <Typography
            sx={{
                fontFamily: 'Kanit',
                fontSize: {xs: 12, md: 18},
                color: 'black',
                mt: 2,
                cursor: 'not-allowed',
            }}
        >
            Auto Redirect: <b>{seconds}s</b>
        </Typography>
    </>
  );
};

export default AutoRedirectTimer;
