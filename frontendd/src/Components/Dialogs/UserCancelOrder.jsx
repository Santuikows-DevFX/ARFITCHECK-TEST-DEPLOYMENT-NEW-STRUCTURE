import React, { useEffect } from 'react';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const UserCancelOrder = ({ open, onClose, zIndex, orderInfo, orderID, fetchMyOrders, type }) => {

    const reasonValidationSchema = Yup.object().shape({
        selectedReason: Yup.string().required('Reason is required')
    });

    const handleCancelOrderRequest = async (cancellationInfo) => {
      try {

        const cancellationData = {
          orderID: orderID,
          reason: cancellationInfo.selectedReason,
          additionalInformation: cancellationInfo.additionalInfo,
          associatedOrderID: orderID,
          type: type
        };

        const apiRoute = type === 'default' ? '/order/cancelOrderRequest' : '/custom/cancelCustomizationRequest';

        await axiosClient.post(`${apiRoute}`, cancellationData)
        .then(( {data} ) => {

          toast.success(`${data.message}`, {
            position: "top-right",
            autoClose: 1500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            onClose: () => {
              onClose(),
              fetchMyOrders()
            },
            style: { fontFamily: 'Kanit', fontSize: '16px' }
          });

        })

      } catch (error) {
        console.log(error);
      }
    }

    return (
        <div>
            <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }} fullWidth maxWidth="md">
               <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 34, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
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
                                            sx={{ width: 160, height: 160}}
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
                                                labelId="reason-label"
                                                id="reason"
                                                name="selectedReason"
                                                label="Reason for Cancellation"
                                                variant="outlined"
                                                sx={{ fontFamily: 'Kanit', fontSize: 20 }}
                                            >
                                                <MenuItem value="Change of Mind">Change of Mind</MenuItem>
                                                <MenuItem value="Size or Fit Issues">Size or Fit Issues</MenuItem>
                                                <MenuItem value="Financial Constraints">Financial Constraints</MenuItem>
                                                <MenuItem value="Duplicate Order">Duplicate Order</MenuItem>
                                                <MenuItem value="Quality Concerns">Quality Concerns</MenuItem>
                                                <MenuItem value="Emergency Situation">Emergency Situation</MenuItem>
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
                                <DialogActions>
                                    <Button onClick={onClose}>
                                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
                                            Close
                                        </Typography>
                                    </Button>
                                    <Button type='submit' color="primary" disabled={isSubmitting || !isValid} onClick={() => handleCancelOrderRequest(values)}>
                                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: !isValid ? 0.5 : 1, cursor: !isValid ? 'not-allowed' : 'default' }}>
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
        </div>
    )
}

export default UserCancelOrder;
