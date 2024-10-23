import React, { useEffect, useRef, useState } from 'react';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Tooltip, CircularProgress, Backdrop } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useSnackbar } from 'notistack';

const userCancelReasonOptions = [
    'Change of Mind',
    'Financial Constraints',
    'Size Issues',
    'Duplicate Order',
    'Quality Concerns',
    'Emergency Situations'
];  

const UserCancelCustomRequests = ({ open, onClose, zIndex, orderInfo, orderID, fetchMyOrders, type }) => {

    const [loading, setLoading] = useState(false);

    const reasonValidationSchema = Yup.object().shape({
        selectedReason: Yup.string().required('Reason is required')
    });

    const { enqueueSnackbar  } = useSnackbar();

    useEffect(() => {
        if (loading) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
    }, [loading]);

    const handleCancelOrderRequest = async (cancellationInfo) => {
      try {
        Swal.fire({
            title: `Are you sure you want to cancel this request?`,
            text: "These changes cannot be revoked",
            icon: "question",
            showCancelButton: true,
            cancelButtonText: 'No',
            confirmButtonColor: '#414a4c',
            confirmButtonText: "Yes",
        }).then(async (result) => {
            if (result.isConfirmed) {
              try {
                setLoading(true); 
                
                const cancellationData = {
                    orderID: orderID,
                    reason: cancellationInfo.selectedReason,
                    additionalInformation: cancellationInfo.additionalInfo,
                    associatedOrderID: orderID,
                    type: type
                };
          
                const apiRoute = type === 'default' ? '/order/cancelOrderRequest' : '/custom/cancelCustomizationRequest';
        
                await axiosClient.post(`${apiRoute}`, cancellationData)
                .then(({ data }) => {
                    setLoading(false);
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
                    onClose();
                });
                
              } catch (error) {
                setLoading(false);
                console.log(error);
              }
            }
        });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    }

    return (
        <div>
            {loading && (
              <Backdrop open={true} style={{ zIndex: zIndex + 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
                  <CircularProgress size={60} sx={{ color: 'white' }} />
                </div>
              </Backdrop>
            )}
            
            <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }} fullWidth maxWidth="md">
            <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 34, fontWeight: 'bold', color: 'white', paddingY: '1vh' }}>
                      {type === 'default' ? 'CANCELLING MY ORDER' : 'CANCELLING MY REQUEST'}
                  </Typography>
                  <Tooltip title="If the order status is still waiting for confirmation, the cancellation request is automatically approved." arrow sx={{ cursor: 'pointer' }}>
                    <div style={{ display: 'inline-block', position: 'relative' }}>
                      <div style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'gray',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                      }}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'white' }}>ℹ️</Typography>
                      </div>
                    </div>
                  </Tooltip>
              </DialogTitle>
                <Divider sx={{ borderTopWidth: 0, mb: 1, backgroundColor: 'black' }} />
                <DialogContent>
                    <Formik
                        initialValues={{ selectedReason: '', additionalInfo: '' }}
                        validationSchema={reasonValidationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(false);
                        }}
                    >
                        {({ isSubmitting, isValid, values }) => (
                            <Form>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={4} display="flex" justifyContent="center" alignItems="center">
                                        <Avatar
                                            alt={orderInfo?.productName || 'Product Image'}
                                            src={orderInfo?.productImage || '/path-to-default-image.jpg'}
                                            sx={{ width: 160, height: 160 }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        {type === 'default' ? (
                                          <>
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 34, fontWeight: 'bold' }}>
                                              {orderInfo?.productName || 'Product Name'}
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'normal' }}>
                                                ₱{(parseInt(orderInfo?.amountToPay) || 0).toFixed(2)} 
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>
                                                <b>Qnt:</b> {orderInfo?.productQuantity} <b>Size:</b> {orderInfo?.productSize || 'Size'}
                                            </Typography>
                                          </>
                                        ) : (
                                            <>
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 34, fontWeight: 'bold' }}>
                                                 [CUSTOMIZED] {orderInfo?.productName || 'Product Name'}
                                                </Typography>
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'normal' }}>
                                                    ₱{(parseInt(orderInfo?.amountToPay) || 0).toFixed(2)} 
                                                </Typography>
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>
                                                    <b>Qnt:</b> {orderInfo?.productQuantity}
                                                </Typography>
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 3, backgroundColor: 'black' }} />
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} display="flex" alignItems="center">
                                        <FormControl fullWidth>
                                            <InputLabel id="reason-label" sx={{ fontFamily: 'Kanit', fontSize: 20 }}>Reason for Cancellation</InputLabel>
                                            <Field
                                                as={Select}
                                                disabled = {loading || isSubmitting}
                                                labelId="reason-label"
                                                id="reason"
                                                name="selectedReason"
                                                label="Reason for Cancellation"
                                                variant="outlined"
                                                sx={{ fontFamily: 'Kanit', fontSize: 20 }}
                                            >

                                                {userCancelReasonOptions.map((reasons, index) => (
                                                    <MenuItem key={index} value={reasons} sx={{ fontFamily: 'Kanit', fontSize: {xs: 15, md: 20} }}> 
                                                      {reasons}
                                                    </MenuItem>
                                                ))}
                                              
                                            </Field>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Field name="additionalInfo">
                                            {({ field, meta }) => (
                                                <TextField
                                                    {...field}
                                                    disabled = {loading || isSubmitting}
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
                                <DialogActions>
                                    <Button onClick={onClose} disabled = {isSubmitting || loading}>
                                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
                                            Close
                                        </Typography>
                                    </Button>
                                    <Button type='submit' color="primary" disabled={isSubmitting || !isValid || values.selectedReason.length === 0 || loading} onClick={() => handleCancelOrderRequest(values)}>
                                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: !isValid || isSubmitting || values.selectedReason.length === 0 ? 0.5 : 1, cursor: !isValid || isSubmitting || values.selectedReason.length === 0 || loading ? 'not-allowed' : 'pointer' }}>
                                            PROCEED
                                        </Typography>
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UserCancelCustomRequests;
