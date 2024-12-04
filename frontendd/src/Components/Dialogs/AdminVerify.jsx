import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, IconButton, FormHelperText, CircularProgress, Backdrop  } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Close, Warning } from '@mui/icons-material';
import axiosClient from '../../axios-client';
import { Visibility, VisibilityOff } from "@mui/icons-material";


import { useSnackbar } from 'notistack';

const AdminVerify = ({ open, onClose, email, orderID, orderType, reason, additionalReason, requestType }) => {

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar  } = useSnackbar();

  console.log(orderType);
  

  const validationSchema = Yup.object().shape({
    password: Yup.string().required('Password is required')
  });

  const INITIAL_FORM_STATE = {
    password: ''
  };

  const censorEmail = (email) => {
    if (email) {
      const [localPart, domain] = email.split('@');
      return `${localPart.slice(0, 2)}*****@${domain}`;
    }
    return '';
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
      setLoading(true);
      await axiosClient.post('/auth/verifyAdmin', { email: email, password: values.password })
        .then(async ({ data }) => {
          if (data.message === `Verified`) {
            const orderData = {
              orderID: orderID,
              associatedOrderID: orderID,
              orderType: orderType,
              cancelReason: reason,
              cancelReasonAdditional: additionalReason
            };
  
            await axiosClient.post('order/updateOrder', orderData)
              .then(({ data }) => {
                enqueueSnackbar(`${data.message}`, {
                  variant: 'success',
                  anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  },
                  autoHideDuration: 2000,
                  style: {
                    fontFamily: 'Kanit',
                    fontSize: '16px'
                  },
                });
                onClose(); 
              });
  
            setLoading(false);
          } else {
            enqueueSnackbar(`Incorrect Password!`, {
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
            setLoading(false);
          }
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleReturnRequest = async (values) => {
    try {
      setLoading(true);
      await axiosClient.post('/auth/verifyAdmin', { email: email, password: values.password })
        .then(async ({ data }) => {
          if (data.message === `Verified`) {
            const orderData = {
              orderID: orderID,
              associatedOrderID: orderID,
            };

            const apiEndPoint = requestType === 'Approve' ? '/order/approveReturnRequest' : '/order/rejectReturnRequest'
  
            await axiosClient.post(`${apiEndPoint}`, orderData)
              .then(({ data }) => {
                enqueueSnackbar(`${data.message}`, {
                  variant: 'success',
                  anchorOrigin: {
                    vertical: 'top',
                    horizontal: 'right'
                  },
                  autoHideDuration: 2000,
                  style: {
                    fontFamily: 'Kanit',
                    fontSize: '16px'
                  },
                });
                onClose(); 
              });
  
            setLoading(false);
          } else {
            enqueueSnackbar(`Incorrect Password!`, {
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
            setLoading(false);
          }
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  return (
    <div>
    {loading && (
        <Backdrop open={true} style={{ zIndex: 1000 + 1}}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
            </div>
        </Backdrop>
    )}
      <Formik
        initialValues={{ ...INITIAL_FORM_STATE }}
        validationSchema={validationSchema}
        onSubmit={orderType === 'Return' ? handleReturnRequest : handleSubmitEmail}
      >
        {({ values, isValid, resetForm}) => (
          <Form>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{zIndex: 1000,
              borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' }}}>
              <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                    VERIFY IF ITS YOU
                </Typography>
                <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
              </DialogTitle> 
              <DialogContent>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
                For security purposes, please enter the password associated with the account <span style={{ fontWeight: 'bold' }}>{censorEmail(email)}</span> to verify if its really you.
                </Typography>
                <Field name="password">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        id="password"
                        label="Password"
                        variant="filled"
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                        error={meta.touched && Boolean(meta.error)}
                        InputProps={{
                            endAdornment: (
                              <>
                                <InputAdornment position="end">
                                    <IconButton
                                      onClick={() =>
                                        setShowPassword((prev) => !prev)
                                      }
                                    >
                                      {showPassword ? (
                                        <VisibilityOff />
                                      ) : (
                                        <Visibility />
                                      )}
                                    </IconButton>
                                  </InputAdornment>
                              </>
                            ),
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
                  orderType === 'Return' ? handleReturnRequest(values) : handleReturnRequest(values)
                  .then(() => {
                    resetForm()
                  })
                }} disabled = {!isValid || loading || values.password.length == 0}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, fontWeight: '350', color: !isValid || loading || values.password.length == 0 ? 'rgba(0, 0, 0, 0.38)' : 'black' }}>
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

export default AdminVerify;
