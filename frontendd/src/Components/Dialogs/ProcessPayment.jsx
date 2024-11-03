import React, { useState, useEffect } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, Typography, IconButton, RadioGroup, Radio, Checkbox, FormControlLabel, CircularProgress, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { Close, Warning, ExpandMore as ExpandMoreIcon, QrCodeScanner as QrCodeScannerIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import Dropzone from 'react-dropzone';
import GCash from './GCash';
import Paymaya from './Paymaya';
import axiosClient from '../../axios-client';
import Swal from 'sweetalert2';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCookies } from 'react-cookie';
import CheckoutTermsAndConditions from './CheckoutTermsAndConditions';
import { useSnackbar } from 'notistack';

const ProcessPayment = ({ open, onClose, requestData, fetchMyOrders, zIndex }) => {

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isEulaChecked, setEulaChecked] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [gCashDialogOpen, setGCashDialogOpen] = useState(false);
  const [paymayaDialogOpen, setPaymayaDialogOpen] = useState(false);
  const [enablePlaceOrder, setEnablePlaceOrder] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [termsAndConditionDialogOpen, setTermsnAndConditionDialog] = useState(false)
  
  const [cookie] = useCookies(['?id']);
  const { enqueueSnackbar  } = useSnackbar();

  // Effect to set the initial payment method based on requestData.ewallet
  useEffect(() => {
    if (requestData?.ewallet) {
      setPaymentMethod(requestData.ewallet);
    }
  }, [requestData]);

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
  };

  const handleEulaChecked = (event) => {
    setEulaChecked(event.target.checked);
  
    if (event.target.checked && uploadedImage) {
      setEnablePlaceOrder(true);
    }else {
      setEnablePlaceOrder(false);
    }
  };

  const handleGcashQRCodeOpen = () => {
    setGCashDialogOpen(true);
  };

  const handleGcashQRCodeClose = () => {
    setGCashDialogOpen(false);
  };

  const handlePaymayaQRCodeOpen = () => {
    setPaymayaDialogOpen(true);
  };

  const handlePaymayaQRCodeClose = () => {
    setPaymayaDialogOpen(false);
  };

  const handleTermsAndCondiDialogOpen = () => {
    setTermsnAndConditionDialog(true)
  }

  const handleTermsAndCondiDialogClose = () => {
    setTermsnAndConditionDialog(false)
  }

  const onDrop = (acceptedFiles) => {
    const receiptFile = acceptedFiles[0];
    const isValidImage = receiptFile && (receiptFile.type === 'image/jpeg' || receiptFile.type === 'image/png' || receiptFile.type === 'image/jpg');
  
    if (isValidImage) {
      setUploadedImage(receiptFile);
      isEulaChecked ? setEnablePlaceOrder(true) : setEnablePlaceOrder(false)
    } else {
      enqueueSnackbar(`Invalid Image!`, { 
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
      setUploadedImage(null);
      setEnablePlaceOrder(false);
    }
  };

  const handleProcessPayment = () => {

    Swal.fire({
      title: 'You are about to send the payment, kindly double check the info especially the receipt. Always check your email for notifications.',
      text: "",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#414a4c',
      confirmButtonText: "Proceed",

    }).then( async (result) => {
      
      if (result.isConfirmed) {

        setSubmitLoading(true)
        
        const paymentValues = new FormData();
        paymentValues.append('requestID', requestData?.orderID);
        paymentValues.append('receiptFile', uploadedImage);
        paymentValues.append('uid', cookie['?id']);
    
        await axiosClient.post('/custom/updateRequestWhenPaid', paymentValues)
        .then(( {data} ) => {
            setSubmitLoading(false);
            enqueueSnackbar(`Request Paid Successfully!`, { 
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
            fetchMyOrders();
            onClose();
        });
      }
    });

  }

  const handleAgree = () => {
    setEulaChecked(true);
    setTermsnAndConditionDialog(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ zIndex, '& .MuiDialog-paper': { borderRadius: '16px' } }}>
      <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 15, md: 34 } }}>
          PAYMENT PROCESSING
        </Typography>
        <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} >
          <Grid item xs={12} md={6}>
            <Box>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, mt: 1, fontWeight: 500, mb: {xs: 0.5, md: 1} }}>
                Payment for: <b><b>{requestData?.orderID}</b></b>
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, color: 'black', fontWeight: 500, mb: {xs: 0.5, md: 1} }}>
                Selected Payment Method: <b>{requestData?.ewallet === 'gcash' ? 'G-Cash' : 'Paymaya'}</b>
              </Typography>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, color: 'black', fontWeight: 500, mb: {xs: 0.5, md: 1} }}>
                Amount to Pay: <b>₱{(requestData?.amountToPay)?.toFixed(2)}</b>
              </Typography>
       
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', alignItems: 'center' , py: 1}}>
                <Warning sx={{ color: '#f1c40f', fontSize: { xs: 25, md: 30 } }} />
                <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 10, md: 12 }, ml: 1, fontWeight: 600 }}>
                  Payment processing will occur after your customization request was approved. If we don't receive payment within <b>2 days after</b> approval, your request will be automatically cancelled.
                </Typography>
              </Box>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 20 }, fontWeight: 'bold', color: 'black' }}>
                  PAYMENT METHOD <br />
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, fontWeight: '300', color: 'black' }}>
                    View all the available payment methods along with their respective QR codes
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 14, md: 18 } }}>G-cash</Typography>
                    <Box>
                      <IconButton>
                        <QrCodeScannerIcon onClick={handleGcashQRCodeOpen} />
                      </IconButton>
                      <Radio value="gcash" name="radio-buttons" inputProps={{ 'aria-label': 'gcash' }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 14, md: 18 } }}>Paymaya</Typography>
                    <Box>
                      <IconButton>
                        <QrCodeScannerIcon onClick={handlePaymayaQRCodeOpen} />
                      </IconButton>
                      <Radio value="paymaya" name="radio-buttons" inputProps={{ 'aria-label': 'paymaya' }} />
                    </Box>
                  </Box>
                </RadioGroup>
              </AccordionDetails>
              {paymentMethod === 'gcash' && (
                <Accordion>
                  <AccordionDetails>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'gray', mb: 1 }}>
                      Please upload a screenshot or photo of your <b>Gcash</b> receipt as proof of payment.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Dropzone onDrop={onDrop} accept="image/jpeg, image/png, image/jpg">
                        {({ getRootProps, getInputProps }) => (
                          <div {...getRootProps()} style={{ cursor: 'pointer', width: '100%', height: '200px', backgroundColor: 'white', borderRadius: '10px', border: '2px dashed #666', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <input {...getInputProps()} />
                            {uploadedImage ? (
                              <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                              <CloudUploadIcon sx={{ fontSize: 60, color: '#666' }} />
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
              {paymentMethod === 'paymaya' && (
                <Accordion>
                  <AccordionDetails>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'gray', mb: 1 }}>
                      Please upload a screenshot or photo of your <b>Paymaya</b> receipt as proof of payment.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Dropzone onDrop={onDrop} accept="image/jpeg, image/png, image/jpg">
                        {({ getRootProps, getInputProps }) => (
                          <div {...getRootProps()} style={{ cursor: 'pointer', width: '100%', height: '200px', backgroundColor: 'white', borderRadius: '10px', border: '2px dashed #666', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <input {...getInputProps()} />
                            {uploadedImage ? (
                              <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                            ) : (
                              <CloudUploadIcon sx={{ fontSize: 60, color: '#666' }} />
                            )}
                          </div>
                        )}
                      </Dropzone>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}
            </Accordion>
            <FormControlLabel
              control={<Checkbox checked={isEulaChecked} onChange={handleEulaChecked} sx={{ transform: 'scale(0.6)' }} />}
              label={
                <Typography sx={{ fontFamily: 'Kanit', display: 'flex', alignItems: 'center', fontSize: {xs: 10, md: 14} }}>
                  I've Read and Agree with the&nbsp;     <span style={{ color: "#1A5276" }}>
                  <b onClick={(event) => {
                    event.preventDefault(); 
                    handleTermsAndCondiDialogOpen();
                  }}> Terms and Conditions*</b>
                </span>
                </Typography>
              }
              sx={{ fontFamily: 'Kanit', fontSize: 16 }}
            />
          </Grid>
        </Grid>
        <Button
          fullWidth
          variant="contained"
          disabled={!enablePlaceOrder || submitLoading}
          onClick={() => handleProcessPayment()}
          sx={{
            mt: {xs: 1, md: 1.5},
            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
            opacity: enablePlaceOrder || submitLoading ? 1 : 0.5,
            background: 'linear-gradient(to right, #414141, #000000)',
          }}
        >
          <Typography
            sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 14, md: 20 },
              padding: 0.5,
              visibility: submitLoading ? 'hidden' : 'visible',
            }}
          >
            PAY
          </Typography>
          {submitLoading && (
            <CircularProgress
                size={24}
                color="inherit"
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                }}
            />
          )}
        </Button>
      </DialogContent>
      <GCash open={gCashDialogOpen} onClose={handleGcashQRCodeClose} />
      <Paymaya open={paymayaDialogOpen} onClose={handlePaymayaQRCodeClose} />
      <CheckoutTermsAndConditions open={termsAndConditionDialogOpen} onClose={handleTermsAndCondiDialogClose} onAgree={handleAgree}/>
    </Dialog>
  );
};

export default ProcessPayment;
