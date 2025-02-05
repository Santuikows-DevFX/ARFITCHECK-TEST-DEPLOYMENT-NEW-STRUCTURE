import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, IconButton, FormHelperText, CircularProgress, Backdrop  } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Close, Warning } from '@mui/icons-material';
import axiosClient from '../../axios-client';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useSnackbar } from 'notistack';

const ForgotPassword = ({ open, onClose }) => {

  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar  } = useSnackbar();

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required')
  });

  const INITIAL_FORM_STATE = {
    email: ''
  };
  
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loading]);

  const handleSubmitEmail = async (values) => {

    try {

      setLoading(true)
      //do a post request with the email as paramater
      await axiosClient.post('/auth/forgotPasswordRequest', {email: values.email})
      .then(({data}) => {

        if(data.message === `A password reset link has been sent to ${values.email}`) {

          enqueueSnackbar(`${data.message}`, { 
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            },
            autoHideDuration: 2300,
            style: {
              fontFamily: 'Kanit',
              fontSize: '16px'
            },
          });

        }else {
          enqueueSnackbar(`${data.message}`, { 
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
        setLoading(false)
        onClose()
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      {loading && (
          <Backdrop open={true} style={{ zIndex: 1000 + 1 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
              <CircularProgress size={60} sx={{ color: 'white' }} />
            </div>
          </Backdrop>
      )}
      <Formik
        initialValues={{ ...INITIAL_FORM_STATE }}
        validationSchema={validationSchema}
        onSubmit={handleSubmitEmail}
      >
        {({ values, isValid, resetForm}) => (
          <Form>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{zIndex: 1000, 
              borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' }}}>
              <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                    FORGOT PASSWORD
                </Typography>
                <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
              </DialogTitle> 
              <DialogContent>
              <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
                  Please enter the email address associated with your account to receive a password reset link.
                </Typography>
                <Field name="email">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        id="email"
                        label="Email"
                        variant="filled"
                        fullWidth
                        type='email'
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                        error={meta.touched && Boolean(meta.error)}
                        InputProps={{
                          endAdornment: meta.touched && meta.error ? (
                            <InputAdornment position="end">
                              <IconButton>
                                <Warning color="error" />
                              </IconButton>
                            </InputAdornment>
                          ) : null
                        }}
                      />
                      {meta.touched && meta.error && (
                        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                          {meta.error}
                        </FormHelperText>
                      )}
                    </div>
                  )}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button type="submit" color="primary" onClick={() => {
                  handleSubmitEmail(values)
                  .then(() => {
                    resetForm()
                  })
                }} disabled = {!isValid || loading || values.email.length == 0}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, fontWeight: '350', color: !isValid || loading || values.email.length == 0 ? 'rgba(0, 0, 0, 0.38)' : 'black' }}>
                    Submit
                  </Typography>
                </Button>
              </DialogActions>
            </Dialog>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPassword;
