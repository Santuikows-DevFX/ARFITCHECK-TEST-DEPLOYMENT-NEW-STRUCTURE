import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import axiosClient from '../axios-client';
import { useSnackbar } from 'notistack';
import { Box } from '@mui/system';
import VerificationMethods from '../Components/Dialogs/VerificationMethods';

const ResendCodeTimer = ({ email }) => {
  const [seconds, setSeconds] = useState(60);
  const [disableResendCode, setDisableResendCode] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [openVerificationMethodDialog, setOpenVerifiationMethodDialog] = useState(false);

  const { enqueueSnackbar  } = useSnackbar();

  const handleOpenVerificationMethodDialog = () => setOpenVerifiationMethodDialog(true)
  const handleCloseVerificationMethodDialog = () => setOpenVerifiationMethodDialog(false)

  useEffect(() => {

    if (seconds > 0) {
      const timerId = setInterval(() => {
        setDisableResendCode(true)
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
      return () => clearInterval(timerId);

    } else {

      // the seconds timer is == 0, therefore we are going to update the verification code for it to be unusable
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

      setResendLoading(true)

      await axiosClient.post('/auth/resendVerificationCode', {email: email})
      .then(({ data }) => {

        enqueueSnackbar(`${data.message}`, { 
          variant: 'success',
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
          //reset the 60 seconds timer when the user clicked the resend code
        setSeconds(60)
        setResendLoading(false)
        setOpenVerifiationMethodDialog(false)

      })

    } catch (error) {
      enqueueSnackbar(`An error occured`, { 
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
      setResendLoading(false)
      setOpenVerifiationMethodDialog(false)
    }
  }

  const handleSendEmailOTP = async () => {
    
    try {

      setResendLoading(true)
      await axiosClient.post('auth/sendOTPCodeToEmail', { email: email })
      .then(( {data} ) => {
        if(data.message) {
          enqueueSnackbar(`${data.message}`, { 
            variant: 'success',
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
          setSeconds(60)
          setResendLoading(false)
          setOpenVerifiationMethodDialog(false)
        }else {
          enqueueSnackbar('Something went wrong.', { 
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
          setResendLoading(false)
          setOpenVerifiationMethodDialog(false)
        }
      });

    }catch(error) {
      console.log(error);
      setResendLoading(false)
      setOpenVerifiationMethodDialog(false)
    }
  }

  return (
    // <Button
    //   disabled= {disableResendCode ? true : false}
    //   sx={{
    //     backgroundColor: 'transparent',
    //     '&:hover': { backgroundColor: 'transparent' },
    //     cursor: 'pointer',
    //     padding: 0,
    //     minWidth: 0,
    //     marginTop: 2,
    //     opacity: disableResendCode ? 0.4 : 1
    //   }}
    //   onClick={() => {
    //     handleResendCode()
    //   }}
    // >
     
    // </Button>
    <>
      {seconds == 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 12, md: 18 },
              color: 'black',
              textDecoration: 'underline',
              opacity: disableResendCode ? 0.4 : 1,
              cursor: 'pointer',
              fontWeight: 500,
            }}
            onClick={() => {
              if(!resendLoading) {
                handleResendCode();
              }else{
                enqueueSnackbar(`Stop Spamming.`, { 
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
            }}
          >
            Resend Code
          </Typography>
          {/* <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 12, md: 18 },
              color: 'black',
              ml: 1,
            }}
          >
            or <span style={{ fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }} 
            onClick={handleOpenVerificationMethodDialog}>Try other method</span>
          </Typography> */}
        </Box>
      ) : (
          <Typography
              sx={{
                fontFamily: 'Kanit',
                fontSize: {xs: 12, md: 18},
                color: 'black',
                mt: 2,
                cursor: 'not-allowed',
                opacity: disableResendCode ? 0.4 : 1,
              }}
          >
              Resend Code: <b>{seconds}s</b>
          </Typography>
      )}
      <VerificationMethods open={openVerificationMethodDialog} onClose={handleCloseVerificationMethodDialog} handleResendCode={handleResendCode} handleSendEmailOTP={handleSendEmailOTP} resendLoading={resendLoading} />
    </>
  );
};

export default ResendCodeTimer;
