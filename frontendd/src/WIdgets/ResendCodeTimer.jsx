import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import axiosClient from '../axios-client';

const ResendCodeTimer = ({ email }) => {
  const [seconds, setSeconds] = useState(60);
  const [disableResendCode, setDisableResendCode] = useState(false)

  useEffect(() => {

    if (seconds > 0) {
      const timerId = setInterval(() => {
        setDisableResendCode(true)
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
      return () => clearInterval(timerId);

    } else {

      //the seconds timer is == 0, therefore we are going to update the verification code for it to be unusable
      try {

        axiosClient.post('/auth/updateVerificationCodeWhenExpired', {email: email})

      } catch (error) {
        console.log(error);
      }

      setDisableResendCode(false)
    }
  }, [seconds]);

  const handleResendCode = async () => {
    try {

        await axiosClient.post('/auth/resendVerificationCode', {email: email})
        .then(({ data }) => {

            toast.success(`${data.message}`, {
                position: "top-right",
                autoClose: 2300,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                style: { fontFamily: 'Kanit', fontSize: '16px' }
            });
        
            //reset the 60 seconds timer when the user clicked the resend code
            setSeconds(60)
        })

    } catch (error) {

        toast.error(`An error occured!`, {
            position: "top-right",
            autoClose: 2300,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            style: { fontFamily: 'Kanit', fontSize: '16px' }
        });

        console.log(error);
    }
  }

  return (
    <Button
      disabled= {disableResendCode ? true : false}
      sx={{
        backgroundColor: 'transparent',
        '&:hover': { backgroundColor: 'transparent' },
        cursor: 'pointer',
        padding: 0,
        minWidth: 0,
        marginTop: 2,
        opacity: disableResendCode ? 0.4 : 1
      }}
      onClick={() => {
        handleResendCode()
      }}
    >
      {seconds == 0 ? (
        <Typography
            sx={{
            fontFamily: 'Kanit',
            fontSize: 18,
            color: 'black',
            }}
        >
            Resend Code
        </Typography>
      ) : (
        <Typography
            sx={{
            fontFamily: 'Kanit',
            fontSize: 16,
            color: 'black',
            }}
        >
            Resend Code: <b>{seconds}s</b>
        </Typography>
      )}
    </Button>
  );
};

export default ResendCodeTimer;
