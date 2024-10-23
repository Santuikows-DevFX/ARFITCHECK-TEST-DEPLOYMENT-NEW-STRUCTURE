import React from 'react';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, MenuItem, Select, FormControl, InputLabel, Divider, TextField } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const cancellationReasons = [
  'Invalid Receipt',
  'Stock Unavailable',
  'Incorrect Order Details',
  'Duplicate Order',
  'Pricing Error',
];

const rejectionReasons = [
  'Design Contains Inappropriate Graphics or Text',
  'Overly Complex Design',
  'Poor Image Quality',
  'Offensive or Prohibited Content',
  'Customization Request is Incomplete or Unclear',
];

const RejectOrder = ({ open, onClose, reqData, zIndex, fetchOrders }) => {

  const { enqueueSnackbar  } = useSnackbar();

  const reasonValidationSchema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    additionalInfo: Yup.string(),
  }).nullable();

  const updateOrd = (values) => {

    const orderData = {
      orderID: reqData?.orderID,
      associatedOrderID: reqData?.orderID,
      orderType: reqData?.type === 'reject' ? 'Reject' : 'Cancel',
      cancelReason: values?.reason,
      cancelReasonAdditional: values?.additionalInfo
    };

    Swal.fire({
      title: `Are you sure you want to ${reqData?.type === 'reject' ? 'reject' : 'cancel'} this customization request?`,
      text: "These changes cannot be revoked",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonColor: '#414a4c',
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          axiosClient.post('custom/updateRequest', orderData)
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

        } catch (error) {
          console.log(error);
        }
      }
    });
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }}>
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 29 }}>
            {reqData?.type === 'reject' ? 'REJECT' : 'CANCEL'} CUSTOMIZATION REQUEST
          </Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{ reason: '', additionalInfo: ''  }}
            validationSchema={reasonValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
              updateOrd(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting, isValid, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography sx={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 400, color: 'black', marginBottom: 2 }}>
                      Kindly select the reason why you are {reqData?.type === 'reject' ? 'rejecting' : 'cancelling'} this customization request, <b>this will reflect on the users order table.</b>
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} display="flex" alignItems="center">
                          <FormControl fullWidth>
                              <InputLabel id="reason-label" sx={{ fontFamily: 'Kanit', fontSize: 20 }}>Reason for Rejection</InputLabel>
                              <Field
                                  as={Select}
                                  labelId="reason-label"
                                  id="reason"
                                  name="reason"
                                  label="Reason for Cancellation"
                                  variant="outlined"
                                  sx={{ fontFamily: 'Kanit', fontSize: 20 }}
                              >
                                {reqData?.type === 'reject' ? (

                                rejectionReasons.map((reason, index) => (
                                  <MenuItem key={index} value={reason} sx={{ fontFamily: 'Kanit', fontSize: 20 }}>
                                    {reason}
                                  </MenuItem>
                                ))
                                ) : (
                                cancellationReasons.map((reason, index) => (
                                  <MenuItem key={index} value={reason} sx={{ fontFamily: 'Kanit', fontSize: 20 }}>
                                    {reason}
                                  </MenuItem>
                                ))
                                )}
                              </Field>
                          </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                          <Field name="additionalInfo">
                              {({ field, meta }) => (
                                <TextField
                                  {...field}
                                  id="additionalInfo"
                                  label="Additional Information (optional)"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                                  inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                                  variant="outlined"
                                  error={meta.touched && meta.error}
                                  helperText={meta.touched && meta.error}
                                  sx={{ width: '100%', fontFamily: 'Kanit' }}
                                />
                              )}
                          </Field>
                      </Grid>
                  </Grid>
                  </Grid>
                </Grid>
                <DialogActions>
                  <Button type='submit' color="primary" disabled={isSubmitting || !isValid || values.reason.length === 0}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: !isValid || isSubmitting || values.reason.length === 0 ? 0.7 : 1 }}>
                      PROCEED
                    </Typography>
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
        <ToastContainer/>
      </Dialog>
    </div>
  );
};

export default RejectOrder;
