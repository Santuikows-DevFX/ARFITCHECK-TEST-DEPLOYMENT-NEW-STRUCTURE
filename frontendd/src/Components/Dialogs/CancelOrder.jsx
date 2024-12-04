import React, { useEffect } from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, MenuItem, Divider, TextField, CircularProgress, Backdrop } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { Close } from '@mui/icons-material';
import { Select } from '@mui/material';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import AdminVerify from './AdminVerify';

const CancelOrder = ({ open, onClose, orderID, orderType, zIndex, fetchOrders }) => {

  const [openAdminVerifyDialog, setOpenAdminVerifyDialog] = useState(false);
  const [adminCancelLoading, setAdminCancelLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonAdditional, setCancelReasonAdditional] = useState('');

  useEffect(() => {
    if (adminCancelLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [adminCancelLoading]);
  
  const handleCloseAdminVerifyDialog = () => {
    setOpenAdminVerifyDialog(false)
    onClose();
  };

  const reasonValidationSchema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    additionalInfo: Yup.string(),
  });

  const updateOrd = (values) => {

    setCancelReason(values?.reason);
    setCancelReasonAdditional(values?.additionalInfo);
    
    Swal.fire({
      title: "Are you sure you want to cancel this order?",
      text: "",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: 'No',
      confirmButtonColor: '#414a4c',
      confirmButtonText: "Yes",

    }).then((result) => {
        if (result.isConfirmed) {
            try {

              setOpenAdminVerifyDialog(true)
             
            } catch (error) {
              console.log(error);
              setAdminCancelLoading(false);
            }
        }
    });
  }

  const cancellationReasons = [
    'Invalid Receipt',
    'Stock Unavailable',
    'Incorrect Order Details',
    'Duplicate Order',
    'Pricing Error',
  ];
  
  return (
    <div>
      <Dialog open={open} onClose={onClose} style={{ zIndex: 1000 }}>
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                CANCELLING ORDER
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <DialogContent>
        <Formik
          initialValues={{ reason: '', additionalInfo: '' }}
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
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 18, fontWeight: 400, color: 'black', marginBottom: 2 }}>
                    Kindly select the reason for canceling this order, <span style={{ color: 'red' }}>*<b>this will reflect on the user's order table.</b></span>
                  </Typography>
                  <Field name="reason">
                    {({ field, meta }) => (
                      <Select
                        id='reason'
                        {...field}
                        fullWidth
                        variant="outlined"
                        error={meta.touched && meta.error}
                        displayEmpty
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 15 } }}
                        inputProps={{ style: { fontSize: 13, fontFamily: 'Kanit' }}}
                        sx={{ width: '100%', fontFamily: 'Kanit', mb: 2 }}
                        helperText={meta.touched && meta.error}
                      >
                        <MenuItem value="" disabled sx={{ fontFamily: 'Kanit', fontSize: 18 }}>
                          Select a reason
                        </MenuItem>
                        {cancellationReasons.map((reason, index) => (
                          <MenuItem key={index} value={reason} sx={{ fontFamily: 'Kanit', fontSize: 18 }}>
                            {reason}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
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
              <DialogActions>
                <Button type="submit" color="primary" disabled={isSubmitting || !isValid || values.reason.length === 0 || adminCancelLoading}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: isSubmitting || !isValid || values.reason.length === 0 || adminCancelLoading ? 0.7 : 1 }}>
                    PROCEED
                  </Typography>
                </Button>
              </DialogActions>

            </Form>
          )}
        </Formik>
        </DialogContent>
      </Dialog>
      <ToastContainer />
      <AdminVerify open={openAdminVerifyDialog} onClose={handleCloseAdminVerifyDialog} email={'bmicclothes@gmail.com'} orderID={orderID} orderType={orderType} reason={cancelReason} additionalReason={cancelReasonAdditional} />
    </div>
  );
}

export default CancelOrder;
