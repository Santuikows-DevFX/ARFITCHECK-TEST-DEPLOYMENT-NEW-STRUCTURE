import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, IconButton, FormHelperText, InputLabel, Select, MenuItem, FormControl, Backdrop, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Close, Warning } from '@mui/icons-material';
import axiosClient from '../../axios-client';
import { ToastContainer, toast, Bounce} from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { useSnackbar } from 'notistack';

const TrackingNumber = ({ open, onClose, orderID, orderType, fetchOrders, type }) => {

  const [loading, setLoading] = useState(false)
  const { enqueueSnackbar  } = useSnackbar();
  const validationSchema = Yup.object().shape({
    trackingNumber: Yup.string()
    .required('Tracking number is required')
    .matches(/^\d{12}$/, 'Tracking number must be exactly 12 digits'),
    estimatedTimeOfDelivery: Yup.string().required('Estimated Time of Delivery is required.')
  });

  const INITIAL_FORM_STATE = {
    trackingNumber: '',
    estimatedTimeOfDelivery: ''
  };

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [loading]);

  const handleSetTrackingNumber = async (values) => {

    try {

      setLoading(true)

      const updateData = {
        orderID: orderID,
        associatedOrderID: orderID,
        orderType: orderType,
        trackingNumber: values.trackingNumber,
        estimatedTimeOfDelivery: values.estimatedTimeOfDelivery
      };

      //do a post request with the email as paramater
      const apiEndPoint = type === 'default' ? '/order/updateOrder' : '/custom/updateRequest'
      await axiosClient.post(`${apiEndPoint}`, updateData)
      .then(({data}) => {

        if (data.message) {

          let message = type === 'default' ? 'Order Updated' : 'Request Updated! Request was moved to orders'

          enqueueSnackbar(`${message}`, { 
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

          setLoading(false)
          onClose();

        }else {
          enqueueSnackbar(`Something went wrong.`, { 
            variant: 'error',
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

          setLoading(false)
          onClose()
        }
      })
    } catch (error) {
      console.log(error);
      setLoading(false);

    }
  }

  const deliveryOptions = [
    { label: '1 - 2 hours', value: 1 },
    { label: '2 - 3 hours', value: 2 },
    { label: '3 - 4 hours', value: 3 },
    { label: '4 - 5 hours', value: 4 },
    { label: 'More than 5 hours', value: 5 }
  ];
  
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
      onSubmit={handleSetTrackingNumber}
     >
      {({ values, isValid, resetForm}) => (
        <Form>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{zIndex: 1000 ,
            borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' }}}>
            <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                  SET TRACKING NUMBER
              </Typography>
              <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
            </DialogTitle> 
            <DialogContent>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
                Please enter the following information provided by JNT. 
                {type === 'custom' ?                 
                <>
                <br />
                <span style={{ color: 'red' }}>*If this is a custom request and it is out for delivery, it will be moved into orders once you updated the status.</span>
                </> : ''}
              </Typography>
              <Field name="trackingNumber">
                {({ field, meta }) => (
                  <div>
                    <TextField
                      {...field}
                      id="trackingNumber"
                      label="Tracking Number"
                      variant="filled"
                      fullWidth
                      InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                      sx={{
                        '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                        backgroundColor: '#E0DFDF',
                      }}
                      inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                      error={meta.touched && Boolean(meta.error)}
                    />
                    {meta.touched && meta.error && (
                      <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                        {meta.error}
                      </FormHelperText>
                    )}
                  </div>
                )}
              </Field>
              <Field name="estimatedTimeOfDelivery">
                {({ field, meta }) => (
                  <div>
                    <FormControl variant="filled" fullWidth error={meta.touched && Boolean(meta.error)} sx={{ mb: 2, mt: 2 }}>
                      <InputLabel sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                        Estimated Hours for Delivery
                      </InputLabel>
                      <Select
                        {...field}
                        id="estimatedTimeOfDelivery"
                        label="Estimated Hours for Delivery"
                        variant="filled"
                        fullWidth
                        sx={{
                          backgroundColor: '#E0DFDF',
                          '& .MuiSelect-select': { fontSize: 16, fontFamily: 'Kanit', pt: { xs: 2, sm: 2, md: 3 } },
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                      >
                        {deliveryOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 20 } }}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {meta.touched && meta.error && (
                        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                          {meta.error}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                )}
              </Field>
            </DialogContent>
            <DialogActions>
               <Button type="submit" color="primary" onClick={() => {
                handleSetTrackingNumber(values)
                .then(() => {
                  resetForm()
                })
              }} disabled = {!isValid || loading || values.trackingNumber.length == 0 || values.estimatedTimeOfDelivery.length == 0}>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, fontWeight: '350', color: !isValid || loading || values.trackingNumber.length == 0 || values.estimatedTimeOfDelivery.length == 0? 'rgba(0, 0, 0, 0.38)' : 'black' }}>
                  Proceed
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

export default TrackingNumber;