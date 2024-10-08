import React, { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, IconButton, FormHelperText, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Close, Warning } from '@mui/icons-material';
import axiosClient from '../../axios-client';

import 'react-toastify/dist/ReactToastify.css';

const TrackingNumber = ({ open, onClose, orderID, orderType, fetchOrders }) => {

  const [loading, setLoading] = useState(false)

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
      await axiosClient.post('/order/updateOrder', updateData)
      .then(({data}) => {

        if (data.message) {
          setLoading(false);
          fetchOrders();
          onClose()
        }
      })
      
    } catch (error) {
      console.log(error);
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
    <Formik
      initialValues={{ ...INITIAL_FORM_STATE }}
      validationSchema={validationSchema}
      onSubmit={handleSetTrackingNumber}
    >
      {({ values, isValid, resetForm}) => (
        <Form>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ 
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
  );
};

export default TrackingNumber;