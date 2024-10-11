import React, { useEffect, useState } from 'react';
import { RadioGroup, Typography, Grid, Box, FormControlLabel, Radio, Button, MenuItem , Paper, Checkbox, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Dialog, Accordion, AccordionSummary, AccordionDetails, IconButton } from '@mui/material';
import axiosClient from '../../../axios-client';
import { Divider } from '@mui/material';
import Dropzone, { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material'; 
import { Form, Field, useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup'

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCookies } from 'react-cookie';
import StyledTextFields from '../../../Components/UI/TextFields';
import PreLoader from '../../../Components/PreLoader';
import OrderSuccess from '../../../Components/Dialogs/OrderSucess';
import { useNavigate, useParams } from 'react-router-dom';
import GCash from '../../../Components/Dialogs/GCash';
import Paymaya from '../../../Components/Dialogs/Paymaya';
import CheckoutTermsAndConditions from '../../../Components/Dialogs/CheckoutTermsAndConditions';
import Navbar from '../../../Widgets/Navbar';
import Footer from '../../../Components/Footer';
import { useCart } from '../../../ContextAPI/CartProvider';

import shopGraffitiBG from '../../../../public/assets/shopGraffiti1.png'

const provinceOptions = ['Metro Manila'];

function SingleProductCheckout() {

  const [cookie] = useCookies(['?id'])

  const {productID, quantity, size} = useParams();

  const [orderDetails, setOrderDetails] = useState([]);
  const [shippingDetails, setShippingDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderTimeStamp, setOrderTimeStamp] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [enablePlaceOrder, setEnablePlaceOrder] = useState(false)
  const [enableAllFields, setEnableAllFields] = useState(false);
  const [dialoOpen, isDialogOpen] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [gcashAccordionOpen, setGcashAccordionOpen] = useState(false);
  const [gCashDialogOpen, setGCashDialogOpen] = useState(false);
  const [paymayaDialogOpen, setPayamaDialogOpen] = useState(false);

  //terms and condition stuff
  const [isEulaChecked, setEulaChecked] = useState(false)
  const [termsAndConditionDialogOpen, setTermsnAndConditionDialog] = useState(false)

  const navigate = useNavigate()

  const { updateCartWhenCheckedOutSuccess } = useCart();

  const ShippingValidationSchema = Yup.object().shape({
    recipientName: enableAllFields ? Yup.string().required('Recipient Name is required') : Yup.string(),
    email: enableAllFields ? Yup.string().required('Email is required') : Yup.string(),
    address: enableAllFields ? Yup.string().required('Address is required') : Yup.string(),
    province: enableAllFields ? Yup.string().required('Province is required') : Yup.string(),
    city: enableAllFields ? Yup.string().required('City is required') : Yup.string(),
    postalCode: enableAllFields ? Yup.string().required('Postal Code is required') : Yup.string(),
    orderNotes: Yup.string(),
  }).nullable();

  const subtotal = orderDetails.length > 0 ? orderDetails.reduce((acc, item) => acc + (item.productPrice * quantity), 0) : 0;

  const formik = useFormik({
    initialValues: {
      recipientName: '',
      email: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      orderNotes: '',
    },
    validationSchema: ShippingValidationSchema,
    onSubmit: async (values) => {

      setSubmitLoading(true)

      setOrderTimeStamp(new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: '2-digit', minute: '2-digit', hour12: true}))

      if(enableAllFields == true) {

        const newShippingValues = new FormData();
        newShippingValues.append('recipientName', values.recipientName);
        newShippingValues.append('email', values.email);
        newShippingValues.append('city', values.city);
        newShippingValues.append('barangay', shippingDetails.barangay);
        newShippingValues.append('address', values.address);
        newShippingValues.append('province', values.province);
        newShippingValues.append('postalCode', values.postalCode);
        newShippingValues.append('orderNotes', values.orderNotes);
        newShippingValues.append('paymentMethod', paymentMethod === 'gcash' || paymentMethod === 'paymaya' ? 'ewallet' : 'cash');
        newShippingValues.append('amountToPay', subtotal);
        newShippingValues.append('receiptFile', uploadedImage);
        newShippingValues.append('uid', cookie['?id']);
        newShippingValues.append('orderType', 'default');
        
        newShippingValues.append('productID', productID); 
        newShippingValues.append('productQuantity', quantity);
        newShippingValues.append('productSize', size)

        await axiosClient.post('order/singleProductPlaceOrder', newShippingValues);
        setTimeout(() => {

          isDialogOpen(true)
          setSubmitLoading(false)
          updateCartWhenCheckedOutSuccess();

        }, 1500);

      }else {

        const dbValues = new FormData();
        dbValues.append('recipientName', userDetails.firstName + ' ' + userDetails.lastName);
        dbValues.append('email', userDetails.email);
        dbValues.append('city', shippingDetails.city);
        dbValues.append('barangay', shippingDetails.barangay);
        dbValues.append('address', shippingDetails.addressLine);
        dbValues.append('province', shippingDetails.province);
        dbValues.append('postalCode', shippingDetails.postalCode);
        dbValues.append('orderNotes', values.orderNotes);
        dbValues.append('paymentMethod', paymentMethod === 'gcash' || paymentMethod === 'paymaya' ? 'ewallet' : 'cash');
        dbValues.append('amountToPay', subtotal);
        dbValues.append('receiptFile', uploadedImage);
        dbValues.append('uid', cookie['?id']);
        dbValues.append('orderType', 'default');

        dbValues.append('productID', productID);
        dbValues.append('productQuantity', quantity);
        dbValues.append('productSize', size)

        await axiosClient.post('order/singleProductPlaceOrder', dbValues);
        setTimeout(() => {

         setSubmitLoading(false)
         isDialogOpen(true)
         updateCartWhenCheckedOutSuccess();

        }, 1500);

      }
    },
  });

  const handleDialogClose =() => {
    isDialogOpen(false)
    navigate('/shop')
  }

  //gcash
  const handleGcashQRCodeOpen = () => {
    setGCashDialogOpen(true);
  };

  const handleGcashQRCodeClose = () => {
    setGCashDialogOpen(false);
  };

  //paymaya
  const handlePaymayaQRCodeOpen = () => {
    setPayamaDialogOpen(true);
  };

  const handlePaymayaQRCodeClose = () => {
    setPayamaDialogOpen(false);
  };

  //---------------

  useEffect(() => {
    fetchOrderDetails();
  }, [productID, quantity, size]);


  //handles the picture dropping
  const onDrop = (acceptedFiles) => {
    const receiptFile = acceptedFiles[0];
    const isValidImage = receiptFile && (receiptFile.type === 'image/jpeg' || receiptFile.type === 'image/png' || receiptFile.type === 'image/jpg');
  
    if (isValidImage) {
      setUploadedImage(receiptFile);
      // setEnablePlaceOrder(true);
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
  
  const fetchOrderDetails = async () => {
    try {

      const orderDetails = await axiosClient.get(`prd/fetchProductByID/${productID}`)
      const shippingDetailsResponse = await axiosClient.get(`auth/getMyAddress/${cookie['?id']}`);
      const userDetailsResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);

      if (shippingDetailsResponse.data && userDetailsResponse.data && orderDetails.data && orderDetails.data.length > 0) {
        setShippingDetails(shippingDetailsResponse.data);
        setUserDetails(userDetailsResponse.data);
        setOrderDetails(orderDetails.data)

        setLoading(false)
      }else {
        setLoading(false)
        navigate('/shop')
      }
      
    } catch (error) {
      console.log(error);
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    if (event.target.value === 'gcash' || event.target.value === 'paymaya') {
      setGcashAccordionOpen(true);
    } else {
      setGcashAccordionOpen(false);
    }

    setUploadedImage(null);
    setEnablePlaceOrder(false);
    setEulaChecked(false)

  };
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/jpeg, image/png' });


  //terms and conditions
  const handleEulaChecked = (event) => {
    setEulaChecked(event.target.checked);
  
    if (event.target.checked && uploadedImage) {
      setEnablePlaceOrder(true);
    }else if (event.target.checked && paymentMethod === 'cash') {
      setEnablePlaceOrder(true)
    } else {
      setEnablePlaceOrder(false);
    }
  };

  const handleAgree = () => {
    setEulaChecked(true);
    setTermsnAndConditionDialog(false);
  };

  //tersm and condition dialog
  const handleTermsAndCondiDialogOpen = () => {
    setTermsnAndConditionDialog(true)
  }

  const handleTermsAndCondiDialogClose = () => {
    setTermsnAndConditionDialog(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
      {loading ? (
        <PreLoader/>
      ) : (
        <>
        <Navbar />
          <Grid container  sx={{ pt: '5vh', minHeight: 0, flex: '1', overflowX: 'hidden' }}>
            <Grid item xs={12} md={7} sx={{
              backgroundImage: `url(${shopGraffitiBG})`,
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 'auto'
            }}>
        <Box sx={{ m: "auto", p: { xs: 2, md: 3 } }}>
          <Paper elevation={0} sx={{
            borderRadius: '16px',
            p: 3,
            width: '98%',
            margin: 'auto',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}>
            <FormikProvider value={formik}>
              <Form>
                <Typography sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs:25, md: 30 },
                  fontWeight: 'bold',
                  color: 'black',
                  paddingY: { xs:0, md: "1vh" },
                  textAlign: "left"
                }}>
                  {enableAllFields ? 'SHIPPING DETAILS' : 'BILLING DETAILS'}
                </Typography>
                <Divider sx={{ my: 2, backgroundColor: 'black' }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="recipientName">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{
                            ...field,
                            value: !enableAllFields ? `${userDetails.firstName} ${userDetails.lastName}` : field.value
                          }}
                          meta={meta}
                          id="recipientName"
                          label="Recipient"
                          disabled={!enableAllFields}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="email">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{
                            ...field,
                            value: !enableAllFields ? `${userDetails.email}` : field.value
                          }}
                          meta={meta}
                          id="email"
                          label="Email"
                          disabled={!enableAllFields}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="province">
                      {({ field, meta }) => (
                        <FormControl fullWidth variant="filled">
                          <InputLabel htmlFor="province" sx={{ fontFamily: 'Kanit' }}>Province</InputLabel>
                          <Select
                            {...field}
                            inputProps={{ id: 'province' }}
                            value={enableAllFields ? '' : 'Metro Manila'}
                            fullWidth
                            error={meta.touched && meta.error}
                            disabled={!enableAllFields}
                          >
                            {provinceOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'black' }}>
                                  {option}
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
                          {meta.touched && meta.error && (
                            <FormHelperText error>{meta.error}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="address">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{
                            ...field,
                            value: !enableAllFields ? `${shippingDetails.addressLine}` : field.value
                          }}
                          meta={meta}
                          id="address"
                          label="Address Line"
                          disabled={!enableAllFields}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="city">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{
                            ...field,
                            value: !enableAllFields ? `${shippingDetails.city}` : field.value
                          }}
                          meta={meta}
                          id="city"
                          label="City"
                          disabled={!enableAllFields}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="postalCode">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{
                            ...field,
                            value: !enableAllFields ? `${shippingDetails.postalCode}` : field.value
                          }}
                          meta={meta}
                          id="postalCode"
                          label="Postal Code"
                          disabled={!enableAllFields}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="orderNotes">
                      {({ field, meta }) => (
                        <StyledTextFields
                          field={{ ...field }}
                          meta={meta}
                          id="orderNotes"
                          label="Order Notes (optional)"
                          multiline
                          rows={4}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={enableAllFields}
                          onChange={(e) => setEnableAllFields(e.target.checked)}
                          color="primary"
                          size="small"
                          sx={{ transform: 'scale(0.9)' }}
                        />
                      }
                      label={<Typography variant="body2">Ship to different address?</Typography>}
                    />
                  </Grid>
                </Grid>
              </Form>
            </FormikProvider>
          </Paper>
        </Box>
      </Grid>
      <Grid item xs={12} md={5} sx={{
        backgroundColor: '#F5F7F8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 'auto'
      }}>
        <Grid item sx={{
          background: 'linear-gradient(to right, #414141, #000000)',
          flex: '0 0 auto',
          width: '100%'
        }}>
          <Box sx={{ m: "5%" }}>
            <Typography sx={{
              fontFamily: 'Kanit',
              fontSize: { xs: 25, md: 30 },
              fontWeight: 'bold',
              color: 'WHITE'
            }}>
              ORDER DETAILS
            </Typography>
            <Grid container justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: 25, fontWeight: 'bold', color: 'WHITE' }}>
                        Product(s)
                      </Typography>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: 25, fontWeight: 'bold', color: 'WHITE' }}>
                        {/* Total */}
                      </Typography>
                    </Grid>
                    <Grid container justifyContent="space-between" alignItems="center">
                      {orderDetails.length > 0 ? (
                        orderDetails.map((cartItem) => (
                          <React.Fragment key={cartItem.productId}>
                            <Grid container justifyContent="space-between" alignItems="center">
                              <Grid item xs={6}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                                  {cartItem.productName} x{quantity}
                                </Typography>
                              </Grid>
                              <Grid item xs={6} textAlign="right">
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                                  ₱{(cartItem.productPrice * quantity).toFixed(2)}
                                </Typography>
                              </Grid>
                            </Grid>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                            -
                          </Typography>
                          <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE', textAlign: 'right' }}>
                            ₱0
                          </Typography>
                        </>
                      )}
                    </Grid>
                    <Box sx={{ height: '16px' }} />
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Grid item sx={{ width: '50%' }}>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                          Subtotal
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                          Shipping Fee
                        </Typography>
                        <Divider sx={{ backgroundColor: 'white', marginTop: '8px', width: '80vh', marginBottom: '10px'}} />
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 30, fontWeight: 'bold', color: 'WHITE' }}>
                          Total
                        </Typography>
                      </Grid>
                      <Grid item sx={{ width: '50%', textAlign: 'right' }}>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                          ₱{subtotal.toFixed(2)}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                          ₱100.00
                        </Typography>
                        <Typography sx={{ fontFamily: 'Inter', fontSize: 25, fontWeight: 'bold', color: 'WHITE', marginTop: '17px'}}>
                        ₱{(subtotal + 100).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
          </Box>
        </Grid>
        <Grid item sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <Box sx={{ m: "5%" }}>
          <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 25, md: 30 }, fontWeight: 'bold', color: 'black' }}>
                     PAYMENT METHOD <br />
                    <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 12, md: 20 }, fontWeight: '300', color: 'black' }}>
                     View all the available payment method along with its respective qr codes
                    </Typography>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails >
                  <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontFamily: 'Kanit' }}>Cash</Typography>
                            <Radio
                              value="cash"
                              name="radio-buttons"
                              inputProps={{ 'aria-label': 'cash' }}
                            />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: 'Kanit' }}>G-cash</Typography>
                      <Box>
                        <IconButton >
                           <QrCodeScannerIcon onClick = {handleGcashQRCodeOpen} />
                        </IconButton>
                      <Radio
                          value="gcash"
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'gcash' }}
                      /></Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: 'Kanit' }}>Paymaya</Typography>
                      <Box>
                        <IconButton >
                           <QrCodeScannerIcon onClick = {handlePaymayaQRCodeOpen} />
                        </IconButton>
                      <Radio
                          value="paymaya"
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'paymaya' }}
                      /></Box>
                  </Box>
                  </RadioGroup>
                </AccordionDetails>
                {paymentMethod === 'gcash' && (
                  <Accordion>
                    <AccordionDetails>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 25 }, color: 'gray' }}>
                        Please upload a screenshot or photo of your <b>Gcash</b> receipt as proof of payment.
                      </Typography>
                        <Box sx={{ mt: 2 }}>
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
                       </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
                {paymentMethod === 'paymaya' && (
                  <Accordion>
                    <AccordionDetails>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 25 }, color: 'gray' }}>
                        Please upload a screenshot or photo of your <b>Paymaya</b> receipt as proof of payment.
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ mt: 2 }}>
                            <div {...getRootProps()} style={{ cursor: 'pointer', width: '100%', height: '200px', backgroundColor: 'white', borderRadius: '10px', border: '2px dashed #666', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                              <input {...getInputProps()} />
                              {uploadedImage ? (
                                <img src={URL.createObjectURL(uploadedImage)} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                              ) : (
                                <CloudUploadIcon sx={{ fontSize: 60, color: '#666' }} />
                              )}
                          </div>
                          </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                )}
              </Accordion>
              <FormControlLabel
                          control={<Checkbox checked={isEulaChecked} onChange={handleEulaChecked} sx={{ 
                            transform: 'scale(0.8)' 
                          }} />}
                          label={
                            <Typography sx={{ fontFamily: 'Inter', display: 'flex', alignItems: 'center', fontSize: 16 }}>
                              <span>I Agree with the </span>
                              <span style={{ color: "#1A5276" }}>
                                <b onClick={(event) => {
                                  event.preventDefault(); 
                                  handleTermsAndCondiDialogOpen();
                                }}> Terms and Conditions</b>
                              </span>
                            </Typography>
                          }
                         sx={{ fontFamily: 'Kanit', fontSize: 16 }}
                        />
                        {/* Place order button */}
                        <Button
                          fullWidth
                          onClick={formik.handleSubmit}
                          variant="contained"
                          disabled={!enablePlaceOrder}
                          sx={{
                            backgroundColor: 'White',
                            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                            opacity: enablePlaceOrder ? 1 : 0.5,
                            background: 'linear-gradient(to right, #414141, #000000)'
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
                            PLACE ORDER
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
                  </Grid>
                </Grid> 
              </Grid>
            <CheckoutTermsAndConditions open={termsAndConditionDialogOpen} onClose={handleTermsAndCondiDialogClose} onAgree={handleAgree}/>
            <GCash open={gCashDialogOpen} onClose={handleGcashQRCodeClose} />
            <Paymaya open={paymayaDialogOpen} onClose={handlePaymayaQRCodeClose} />
            <Dialog open={dialoOpen} onClose={handleDialogClose} maxWidth="xl" fullWidth PaperProps={{ style: { maxHeight: '100vh' } }}>
                <div>
                  <OrderSuccess onClose={handleDialogClose} timeStamp={orderTimeStamp}/>
                </div>
            </Dialog>
        <Footer/>
        <ToastContainer/>
        </>
      )}
    </div>
  );
}

export default SingleProductCheckout;