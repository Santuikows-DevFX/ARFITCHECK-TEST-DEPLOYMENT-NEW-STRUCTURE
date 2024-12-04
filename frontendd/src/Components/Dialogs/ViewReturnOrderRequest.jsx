import React, { useEffect, useState } from 'react';
import { Grid, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Divider, FormControl, InputLabel, Select, MenuItem, Backdrop, CircularProgress } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import axiosClient from '../../axios-client';
import CloseIcon from '@mui/icons-material/Close';

import { useSnackbar } from "notistack";
import { Box } from '@mui/system';
import AdminVerify from './AdminVerify';

const ViewReturnOrderRequest = ({ open, onClose, zIndex, orderInfo, orderID, fetchOrders, type }) => {

    const [updateCancelRequestLoading, setUpdateCancelRequestLoading] = useState(false);
    const [openAdminVerifyDialog, setOpenAdminVerifyDialog] = useState(false);
    const [requestType, setRequestType] = useState('');
    const { enqueueSnackbar  } = useSnackbar();

    const reasonValidationSchema = Yup.object().shape({
        selectedReason: Yup.string().required('Reason is required')
    });

    const handleCloseAdminVerifyDialog = () => {
        setOpenAdminVerifyDialog(false)
        onClose();
    };

    useEffect(() => {
        if (updateCancelRequestLoading) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
    }, [updateCancelRequestLoading]);
 
    const handleApproveCancelRequest = async (cancellationInfo, orderType) => {
        try {

            Swal.fire({
                title: "Are you sure you want to approve this return request?",
                text: "Approving this request means that you agreed in the request to return this order and it will reflect on the user end. Once approved, it will reflect in sales immediately. Also check in PayMongo if the user paid, you also need to refund it.",
                icon: "question",
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#414a4c',
                confirmButtonText: "Yes",
            }).then((result) => {
                if (result.isConfirmed) {

                    setOpenAdminVerifyDialog(true)
                    setRequestType('Approve')
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    const handleRejectRequest = () => {
        try {

            Swal.fire({
                title: "Are you sure you want to reject this request?",
                text: "Rejecting this request will reflect on the users-end and notify them. These changes cannot be revoked.",
                icon: "question",
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#414a4c',
                confirmButtonText: "Yes",
            }).then((result) => {
                if (result.isConfirmed) {

                    setOpenAdminVerifyDialog(true)
                    setRequestType('Reject');
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    const openImageInNewTab = (imageUrl) => {
        window.open(imageUrl, '_blank');
    };

    return (
        <div>
            {updateCancelRequestLoading && (
              <Backdrop open={true} style={{ zIndex: zIndex + 1 }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
                  <CircularProgress size={60} sx={{ color: 'white' }} />
                </div>
              </Backdrop>
            )}
            <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }} fullWidth maxWidth="md">
                <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                        RETURN ORDER REQUEST
                    </Typography>
                    <CloseIcon onClick={onClose} sx={{ cursor: 'pointer' }} />
                </DialogTitle>
                <Divider />
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
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 38 }}>
                                    Order Info:
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Order ID:</b> {orderID}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    {type === 'custom' ? (
                                        <>
                                            <b>Product(s): </b>[CUSTOMIZED] {orderInfo.productName}
                                        </>
                                    ) : (
                                        <>
                                            <b>Product(s): </b> {orderInfo.productName}
                                        </>
                                    )}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Total: </b> ₱{(orderInfo.amountToPay).toFixed(2)}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Order Date and Time:</b> {orderInfo.orderDate} {orderInfo.orderTimeStamp}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Payment Method:</b> {orderInfo?.paymentMethod === 'cash' ? 'Cash' : 'E-Wallet' || 'None'}
                                </Typography>
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                    <b>Mobile No.:</b> {orderInfo?.mobileNumber || 'NaN'}
                                </Typography>
                                {type === 'custom' ? (
                                    <>
                                        <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', ml: 2 }}>
                                            <b>Custom Image:</b> <span style={{ color: '#1F618D', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { openImageInNewTab(orderInfo?.customImage) }}>Open Custom Image</span>
                                        </Typography>
                                    </>
                                ) : null}
                                <Divider sx={{ my: 2, backgroundColor: 'black' }} />
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', color: 'gray' }}>
                                    A customer requested to return his/her order(s) due to the following reason
                                </Typography>
                                <TextField
                                    id="userCancelReason"
                                    name="userCancelReason"
                                    label="Reason for Cancellation"
                                    fullWidth
                                    variant="outlined"
                                    value={orderInfo?.userReturnReason || ''}
                                    disabled
                                    sx={{ my: 1, fontFamily: 'Kanit', fontWeight: 'bold' }}
                                />
                                <TextField
                                    id="userCancelReasonAdditional"
                                    name="userCancelReasonAdditional"
                                    label="Additional Information"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                    value={orderInfo?.userReturnReasonAdditional || 'None'}
                                    disabled
                                    sx={{ my: 2, fontFamily: 'Kanit' }}
                                />
                                <Divider sx={{ backgroundColor: 'black', mb: 2, mt: 2 }} />
                                <Typography variant="body1" gutterBottom sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 22 }}>
                                    Proof Images:
                                </Typography>
                                <Grid container spacing={2} justifyContent="center">
                                    {orderInfo?.returnImage || orderInfo?.returnImage1 || orderInfo?.returnImage2 || orderInfo?.returnImage3 ? (
                                        <>
                                            {orderInfo?.returnImage && (
                                                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            border: '2px dashed gray',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: '280px',  
                                                        }}
                                                    >
                                                        <img
                                                            src={orderInfo?.returnImage}
                                                            alt="Proof"
                                                            style={{
                                                                width: '80%', 
                                                                height: '80%',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => openImageInNewTab(orderInfo?.returnImage)}
                                                        />
                                                    </Box>
                                                </Grid>
                                            )}

                                            {/* returnImage1 */}
                                            {orderInfo?.returnImage1 && (
                                                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            border: '2px dashed gray',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: '280px',  
                                                        
                                                        }}
                                                    >
                                                        <img
                                                            src={orderInfo?.returnImage1}
                                                            alt="Proof 1"
                                                            style={{
                                                                width: '80%',
                                                                height: '80%',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                            onClick={() => openImageInNewTab(orderInfo?.returnImage1)}

                                                        />
                                                    </Box>
                                                </Grid>
                                            )}

                                            {/* returnImage2 */}
                                            {orderInfo?.returnImage2 && (
                                                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            border: '2px dashed gray',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: '280px',  
                                                        

                                                        }}
                                                    >
                                                        <img
                                                            src={orderInfo?.returnImage2}
                                                            alt="Proof 2"
                                                            style={{
                                                                width: '80%',
                                                                height: '80%',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                                
                                                            }}
                                                            onClick={() => openImageInNewTab(orderInfo?.returnImage2)}
                                                        />
                                                    </Box>
                                                </Grid>
                                            )}

                                            {/* returnImage3 */}
                                            {orderInfo?.returnImage3 && (
                                                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                                                    <Box
                                                        sx={{
                                                            border: '2px dashed gray',
                                                            borderRadius: '4px',
                                                            padding: '5px',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: '100px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <img
                                                            src={orderInfo?.returnImage3}
                                                            alt="Proof 3"
                                                            style={{
                                                                width: '80%',
                                                                height: '80%',
                                                                objectFit: 'cover',
                                                                borderRadius: '4px',
                                                            }}
                                                            onClick={() => openImageInNewTab(orderInfo?.returnImage)}

                                                        />
                                                    </Box>
                                                </Grid>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="gray" sx={{ ml: 2 }}>
                                            No proof images available.
                                        </Typography>
                                    )}
                                </Grid>


                                <DialogActions>
                                    <Button
                                        sx={{ color: 'red' }}
                                        disabled={isSubmitting || updateCancelRequestLoading}
                                        onClick={() => handleRejectRequest()}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        type="submit"
                                        sx={{ color: 'black' }}
                                        disabled={isSubmitting || updateCancelRequestLoading}
                                        onClick={() => handleApproveCancelRequest(values, 'Cancel')}
                                    >
                                        Approve
                                    </Button>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
            <AdminVerify open={openAdminVerifyDialog} onClose={handleCloseAdminVerifyDialog} email={'bmicclothes@gmail.com'} orderID={orderID} orderType={'Return'} requestType={requestType} reason={''} additionalReason={''} />
        </div>
    )
}

export default ViewReturnOrderRequest;
