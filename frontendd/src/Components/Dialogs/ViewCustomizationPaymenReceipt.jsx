import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, CircularProgress, Grid, Divider, DialogActions, Backdrop } from '@mui/material';
import { Close } from '@mui/icons-material';

import axiosClient from '../../axios-client';
import Swal from 'sweetalert2';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useSnackbar } from 'notistack';

const ViewCustomizationPaymentReceipt = ({ open, onClose, requestData, fetchOrders ,zIndex }) => {

  const [submitLoading, setSubmitLoading] = useState(false)
  const { enqueueSnackbar  } = useSnackbar();

  const [cookie] = useCookies(['?id']);

  useEffect(() => {
    if (submitLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [submitLoading]);

  
  const handleConfirmPayment = () => {

    try {

      Swal.fire({
        title: 'Confirm payment?',
        text: "Please make sure you have double checked the receipt and details.",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Confirm",
  
      }).then( async (result) => {
        
        if (result.isConfirmed) {
  
          setSubmitLoading(true)
  
          const reqData = {
            orderID: requestData?.orderID,
            orderType: 'Prepare'
          };
      
          await axiosClient.post('/custom/updateRequest', reqData)
          .then(( {data} ) => {
              setSubmitLoading(false);
  
              if (data.message === 'Request Status Updated') {
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
                onClose();
                setSubmitLoading(false);
  
              }
          });
        }
      });
      
    } catch (error) {
      console.log(error);
      setSubmitLoading(false)
      
    }

  }

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div>
      {submitLoading && (
        <Backdrop open={true} style={{ zIndex: 1000 + 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </div>
        </Backdrop>
      )}
      <Dialog
        open={open}
        fullWidth
        onClose={onClose}
        sx={{ borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' } }}
        style={{ zIndex: zIndex }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(to left, #414141, #000000)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 4,
          }}
        >
          <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
            PAYMENT RECEIPT
          </Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ flex: '1 1 auto', width: '100%' }}>
            <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'bold', marginBottom: 1 }}>
                RECEIPT IMAGE:
              </Typography>
              <Box
                onClick = {() => openImageInNewTab(requestData?.orderInfo?.receiptImage)}
                sx={{
                  width: '100%',
                  height: { xs: '250px', md: '420px' }, 
                  backgroundColor: '#e0e0e0',
                  borderRadius: '10px',
                  backgroundImage: `url(${requestData?.orderInfo?.receiptImage})`, 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)', 
                    zIndex: 1,
                    cursor: 'pointer'
                  },
                }}
              />
            </Grid>

            <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'black', mx: 2.5 }} />
            <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 22 }, fontWeight: 'bold', marginBottom: 1 }}>
                REQUEST DETAILS:
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Request ID:</b> <br />{requestData?.orderID}
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Request Date and Time:</b> <br />{requestData?.orderInfo?.orderDate} - {requestData?.orderInfo?.orderTimeStamp}
              </Typography>

              <Divider sx={{ my: 1, backgroundColor: 'bla', height: 2 }} /> 

              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 22 }, fontWeight: 'bold', marginBottom: 1 }}>
                PAYMENT DETAILS:
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Payment Date</b>: <br />{requestData?.orderInfo?.paymentDate}
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Payment Method</b>: <br />{requestData?.orderInfo?.selectedEWallet === 'gcash' ? 'G-Cash' : 'Paymaya'}
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Amount Paid</b>: <br /> ₱{(requestData?.orderInfo?.amountToPay)?.toFixed(2)}
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 18 }, color: 'black', marginBottom: 1 }}>
                <b>Mobile Number</b>: <br /> {requestData?.orderInfo?.mobileNumber}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button color="primary" onClick={() => handleConfirmPayment()} disabled = {submitLoading}>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black' }}>
              Confirm and Prepare
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewCustomizationPaymentReceipt;
