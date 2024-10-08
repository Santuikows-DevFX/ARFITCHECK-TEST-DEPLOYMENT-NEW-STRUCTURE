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

const ProcessPayment = ({ open, onClose, requestData, fetchMyOrders, zIndex }) => {

  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isEulaChecked, setEulaChecked] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [gCashDialogOpen, setGCashDialogOpen] = useState(false);
  const [paymayaDialogOpen, setPaymayaDialogOpen] = useState(false);
  const [enablePlaceOrder, setEnablePlaceOrder] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  
  const [cookie] = useCookies(['?id']);

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

  const onDrop = (acceptedFiles) => {
    const receiptFile = acceptedFiles[0];
    const isValidImage = receiptFile && (receiptFile.type === 'image/jpeg' || receiptFile.type === 'image/png' || receiptFile.type === 'image/jpg');
  
    if (isValidImage) {
      setUploadedImage(receiptFile);
      isEulaChecked ? setEnablePlaceOrder(true) : setEnablePlaceOrder(false)
    } else {
      toast.error('Invalid Image or EULA not checked', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
        style: { fontFamily: 'Kanit', fontSize: '16px' }
      });
      setUploadedImage(null);
      setEnablePlaceOrder(false);
    }
  };

  const handleProcessPayment = () => {

    Swal.fire({
      title: 'You are about to send the payment, kindly double check the info especially the receipt. ',
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
            fetchMyOrders();
            onClose();
        });
      }
    });

  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' } }} style={{ zIndex: zIndex }}>
      <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
          PAYMENT PROCESSING
        </Typography>
        <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
      </DialogTitle>
      <DialogContent>
        <Grid item sx={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%' }}>
          <Box sx={{ m: "1.5%" }}>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 32 }, mt: -2, fontWeight: 'bold'}}>
                PAYMENT FOR REQUEST ID: {requestData?.orderID}
            </Typography>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 20 }, color: 'black', mb: 1 }}>
                <b>Selected Payment Method</b>: {requestData?.ewallet === 'gcash' ? 'G-Cash' : 'Paymaya'}
            </Typography>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 20 }, color: 'black', mb: 1 }}>
                <b>Amount to Pay</b>: ₱{(requestData?.amountToPay)?.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
              <Warning sx={{ color: '#f1c40f', fontSize: 30 }} />
              <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 10, md: 16 }, ml: 1, fontWeight: 'bold' }}>
                Payment processing will occur after your customization request was approved. If we don't receive payment within 2 days after approval, your request will be automatically cancelled.
              </Typography>
            </Box>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 25, md: 30 }, fontWeight: 'bold', color: 'black' }}>
                  PAYMENT METHOD <br />
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: '300', color: 'black' }}>
                    View all the available payment methods along with their respective QR codes
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: 'Kanit' }}>G-cash</Typography>
                    <Box>
                      <IconButton>
                        <QrCodeScannerIcon onClick={handleGcashQRCodeOpen} />
                      </IconButton>
                      <Radio value="gcash" name="radio-buttons" inputProps={{ 'aria-label': 'gcash' }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontFamily: 'Kanit' }}>Paymaya</Typography>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 25 }, color: 'gray', mb: 1 }}>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 25 }, color: 'gray', mb: 1 }}>
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
              control={<Checkbox checked={isEulaChecked} onChange={handleEulaChecked} sx={{ transform: 'scale(0.8)' }} />}
              label={
                <Typography sx={{ fontFamily: 'Inter', display: 'flex', alignItems: 'center', fontSize: 16 }}>
                  I Agree with the&nbsp;<span style={{ color: "#1A5276" }}> <b onClick={(event) => { event.preventDefault(); }}> Terms and Conditions</b></span>
                </Typography>
              }
              sx={{ fontFamily: 'Kanit', fontSize: 16 }}
            />
            <Button
              fullWidth
              variant="contained"
              disabled={!enablePlaceOrder || submitLoading}
              onClick={() => handleProcessPayment()}
              sx={{
                mt: 2,
                '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                opacity: enablePlaceOrder ? 1 : 0.5,
                background: 'linear-gradient(to right, #414141, #000000)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs: 18, md: 25 },
                  padding: 0.5,
                  visibility: submitLoading ? 'hidden' : 'visible',
                }}
              >
                PROCEED PAYMENT
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
          </Box>
          <GCash open={gCashDialogOpen} onClose={handleGcashQRCodeClose} />
          <Paymaya open={paymayaDialogOpen} onClose={handlePaymayaQRCodeClose} />
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ProcessPayment;
