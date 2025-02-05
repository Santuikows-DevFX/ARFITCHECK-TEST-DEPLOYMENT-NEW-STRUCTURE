import React, { useEffect, useState } from 'react';
import { RadioGroup, Typography, Grid, Box, FormControlLabel, Radio, Button, MenuItem , Paper, Checkbox, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Dialog, Accordion, AccordionSummary, AccordionDetails, IconButton, Autocomplete, TextField } from '@mui/material';
import Navbar from '../../WIdgets/Navbar';
import Footer from '../../Components/Footer';
import axiosClient from '../../axios-client';
import { Divider } from '@mui/material';
import Dropzone, { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material'; 
import { Form, Field, useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup'

import 'react-toastify/dist/ReactToastify.css';
import { useCookies } from 'react-cookie';
import StyledTextFields from '../../Components/UI/TextFields';
import PreLoader from '../../Components/PreLoader';
import OrderSuccess from '../../Components/Dialogs/OrderSucess';
import { useNavigate } from 'react-router-dom';
import GCash from '../../Components/Dialogs/GCash';
import Paymaya from '../../Components/Dialogs/Paymaya';
import CheckoutTermsAndConditions from '../../Components/Dialogs/CheckoutTermsAndConditions';
import { useCart } from '../../ContextAPI/CartProvider';
import dayjs from 'dayjs';

import shopGraffitiBG from '../../../public/assets/shopGraffiti1.png'
import { useSnackbar } from 'notistack';
import TermsAndConditions from '../TermsAndConditions';

const provinceOptions = [ 
  'Metro Manila'
]

const cityOptions = [
  'Caloocan',
  'Malabon',
  'Navotas',
  'Valenzuela',
  'Quezon City',
  'Marikina',
  'Pasig',
  'Taguig',
  'Makati',
  'Manila',
  'Mandaluyong',
  'San Juan',
  'Pasay',
  'Parañaque',
  'Las Piñas',
  'Muntinlupa',
];

function Checkout() {

  document.documentElement.style.setProperty('--primary', 'white');

  const [cookie] = useCookies(['?id'])

  const [orderDetails, setOrderDetails] = useState([]);
  const [shippingDetails, setShippingDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('cash');
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
  const [isErrorWithTheNewShipping, setIsErrorWithTheNewShipping] = useState(false);
  const [termsAndConditionDialogOpen, setTermsnAndConditionDialog] = useState(false)

  const { enqueueSnackbar  } = useSnackbar();

  const navigate = useNavigate()

  const { updateCartWhenCheckedOutSuccess } = useCart();

  const ShippingValidationSchema = Yup.object().shape({
    recipientName: enableAllFields ? 
      Yup.string().required('Recipient Name is required')
      .matches(/^[A-Za-z\s-]+$/, 'Recipient Name must contain only letters, spaces, or hyphens')
      : Yup.string(),
    address: enableAllFields ? Yup.string().required('Address is required') : Yup.string(),
    province: enableAllFields ? Yup.string().required('Province is required') : Yup.string(),
    city: enableAllFields ? Yup.string().required('City is required') : Yup.string(),
    postalCode: enableAllFields ? Yup.string().required('Postal Code is required') : Yup.string(),
    orderNotes: Yup.string(),
  }).nullable();

  const subtotal = orderDetails.length > 0 ? orderDetails.reduce((acc, item) => acc + (item.productPrice * item.productQuantity), 0) : 0;

  const formik = useFormik({
    initialValues: {
      recipientName: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      orderNotes: '',
    },
    validationSchema: ShippingValidationSchema,
    onSubmit: async (values) => {

      try {
        setSubmitLoading(true)
        const productData = orderDetails.map(product => ({
          name: product.productName,
          quantity: product.productQuantity,
          size: product.productSize
        }));
  
        const productDataJSON = JSON.stringify(productData);
        setOrderTimeStamp(new Date().toLocaleTimeString("en-PH", { timeZone: "Asia/Manila", hour: '2-digit', minute: '2-digit', hour12: true}))
        
        if(enableAllFields) {

          const { orderNotes, ...otherValues } = values;

          if(enableAllFields && Object.values(otherValues).some((value) => value === '')) {
            enqueueSnackbar(`I!`, { 
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
          }else {
            const newShippingValues = new FormData();
            newShippingValues.append('recipientName', values.recipientName);
            newShippingValues.append('email', userDetails.email);
            newShippingValues.append('city', values.city);
            newShippingValues.append('barangay', shippingDetails.barangay);
            newShippingValues.append('address', values.address);
            newShippingValues.append('province', values.province);
            newShippingValues.append('postalCode', values.postalCode);
            newShippingValues.append('orderNotes', values.orderNotes);
            newShippingValues.append('paymentMethod', paymentMethod === 'gcash' || paymentMethod === 'paymaya' ? 'ewallet' : 'cash');
            newShippingValues.append('amountToPay', subtotal);
            newShippingValues.append('receiptFile', uploadedImage);
            newShippingValues.append('products', productDataJSON);
            newShippingValues.append('uid', cookie['?id']);
            newShippingValues.append('orderType', 'default');
    
            await axiosClient.post('order/placeOrder', newShippingValues);
            setTimeout(() => {
    
              isDialogOpen(true)
              setSubmitLoading(false)
    
            }, 1500);
          }
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
          dbValues.append('products', productDataJSON);
          dbValues.append('uid', cookie['?id']);
          dbValues.append('orderType', 'default');
  
          await axiosClient.post('order/placeOrder', dbValues)
          .then(({ data }) => {
            updateCartWhenCheckedOutSuccess();
  
            if(paymentMethod === 'cash') { 
              setSubmitLoading(false)
              isDialogOpen(true)
            }else {
              window.location.replace(data.sessionUrl);
            }
          })
        }
      } catch (error) {
        console.log(error);
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
  }, []);

  //handles the picture dropping
  const onDrop = (acceptedFiles) => {
    const receiptFile = acceptedFiles[0];
    const isValidImage = receiptFile && (receiptFile.type === 'image/jpeg' || receiptFile.type === 'image/png' || receiptFile.type === 'image/jpg');
  
    if (isValidImage) {
      setUploadedImage(receiptFile);
      // setEnablePlaceOrder(true);
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
  
  const fetchOrderDetails = async () => {
    try {

      const uid = {
        uid: cookie['?id']
      }

      const orderDetails = await axiosClient.post('cart/getMyCartItems', uid)
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
  
    if ((event.target.checked && paymentMethod === 'cash') || (event.target.checked && paymentMethod === 'gcash')) {
      setEnablePlaceOrder(true)
    } else {
      setEnablePlaceOrder(false);
    }
  };

  //served as a validation if the are some errors in the new shipping fields. I did this because the left section is not connected to the right section where the check box is located.
  const handleCloseEULACheck = () => {
    setEulaChecked(false)
    setEnablePlaceOrder(false)
    setIsErrorWithTheNewShipping(true)
  };

  const handleShipToOtherAddress = (event) => {

    if (event.target.checked) {
      setEnableAllFields(true)
    }else {
      setEnableAllFields(false)
      setIsErrorWithTheNewShipping(false)
    }

    setEulaChecked(false)
    setEnablePlaceOrder(false)

  };

  const handleAgree = () => {
    setTermsnAndConditionDialog(false);
   
    if(paymentMethod != '') {
      setEulaChecked(true);
      setEnablePlaceOrder(true);
    }
  };

  //terms and condition dialog
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
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                mt: {xs: 1, md: 'auto'}
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
                      <Grid item xs={12}>
                        <Field name="recipientName">
                          {({ field, meta }) => (
                            <StyledTextFields
                              field={{
                                ...field,
                                value: !enableAllFields ? `${userDetails.firstName} ${userDetails.lastName}` : field.value
                              }}
                              meta={meta}
                              handleCloseEULACheck={handleCloseEULACheck}
                              id="recipientName"
                              label="Recipient"
                              disabled={!enableAllFields}
                              fullWidth
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field name="province">
                          {({ field, meta, form }) => (
                            <FormControl fullWidth variant="filled">
                              <Autocomplete
                                {...field}
                                id="province"
                                options={provinceOptions}
                                getOptionLabel={(option) => option}
                                onChange={(event, value) => form.setFieldValue('province', value)}
                                value={!enableAllFields ? `${shippingDetails.province}` : field.value}
                                disabled={!enableAllFields}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Province"
                                    variant="filled"
                                    error={meta.touched && Boolean(meta.error)}
                                    InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                    sx={{
                                      '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                    }}
                                    disabled={!enableAllFields}
                                  />
                                )}
                                renderOption={(props, option) => (
                                  <li {...props}>
                                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                                      {option}
                                    </Typography>
                                  </li>
                                )}
                              />
                              {meta.touched && meta.error && (
                                <>
                                  <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                                  {meta.error}
                                  </FormHelperText>
                                </>
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
                              handleCloseEULACheck={handleCloseEULACheck}
                              id="address"
                              label="Address Line"
                              disabled={!enableAllFields}
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                      <Field name="city">
                          {({ field, meta, form }) => (
                            <FormControl fullWidth variant="filled">
                              <Autocomplete
                                {...field}
                                id="city"
                                options={cityOptions}
                                getOptionLabel={(option) => option}
                                onChange={(event, value) => form.setFieldValue('city', value)}
                                value={!enableAllFields ? `${shippingDetails.city}` : field.value}
                                disabled={!enableAllFields}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="City / Municipality"
                                    variant="filled"
                                    error={meta.touched && Boolean(meta.error)}
                                    InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                    sx={{
                                      '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                    }}
                                    disabled={!enableAllFields}
                                  />
                                )}
                                renderOption={(props, option) => (
                                  <li {...props}>
                                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                                      {option}
                                    </Typography>
                                  </li>
                                )}
                              />
                              {meta.touched && meta.error && (
                                  <>
                                    <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                                    {meta.error}
                                    </FormHelperText>
                                    {/* {meta.error && handleCloseEULACheck()} */}
                                  </>
                              )}
                            </FormControl>
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
                              handleCloseEULACheck={handleCloseEULACheck}
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
                              handleCloseEULACheck={handleCloseEULACheck}
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
                              onChange = {handleShipToOtherAddress}
                              color="primary"
                              size="small"
                              sx={{ transform: 'scale(0.9)' }}
                            />
                          }
                          label={<Typography sx = {{ fontFamily: 'Kanit', fontSize: {xs: 16 , md: 18} }}>Ship to different address?</Typography>}
                        />
                      </Grid>
                    </Grid>
                  </Form>
                </FormikProvider>
              </Paper>
            </Box>
          </Grid>
          {/* RIGHT SECTION */}
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
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                              {cartItem.productName} x{cartItem.productQuantity}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} textAlign="right">
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                              ₱{(cartItem.productPrice * cartItem.productQuantity).toFixed(2)}
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
                      Subtotal
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'regular', color: 'WHITE' }}>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: '300', color: 'black' }}>
                      View all the available payment method.
                    </Typography>
                  </Typography>
                </AccordionSummary>
                <AccordionDetails >
                  <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontFamily: 'Kanit' }}>COD (Cash on Delivery)</Typography>
                        <Radio
                          value="cash"
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'cash' }}
                          disabled = {submitLoading}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontFamily: 'Kanit' }}>E-Wallet (GCash, Paymaya, etc.)</Typography>
                      <Box>
                      <Radio
                          value="gcash"
                          name="radio-buttons"
                          inputProps={{ 'aria-label': 'gcash' }}
                          disabled = {submitLoading}
                      /></Box>
                  </Box>
                  </RadioGroup>
                </AccordionDetails>
              </Accordion>
              <FormControlLabel
                control={
                  <Checkbox checked={isEulaChecked} onChange={handleEulaChecked} 
                  sx={{ 
                    transform: 'scale(0.8)' 
                  }} 
                  disabled = {isErrorWithTheNewShipping || submitLoading}
                />}
                label={
                  <Typography sx={{ fontFamily: 'Kanit', display: 'flex', alignItems: 'center', fontSize: {xs: 12, md: 16} }}>
                    I've Read and Agree with the&nbsp;
                    <span style={{ color: "#1A5276" }}>
                      <b onClick={(event) => {
                        event.preventDefault(); 
                        handleTermsAndCondiDialogOpen();
                      }}> Terms and Conditions*</b>
                    </span>
                  </Typography>
                }
                sx={{ fontFamily: 'Kanit', fontSize: 16 }}
              />
              {/* Place order button */}
              <Button
                fullWidth
                onClick={() => {
                  formik.handleSubmit();
                }}
                variant="contained"
                disabled={!enablePlaceOrder || submitLoading}
                sx={{
                  backgroundColor: 'White',
                  '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                  '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                  opacity:  submitLoading || !enablePlaceOrder ? 0.5 : 1,
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
                  {paymentMethod === 'cash' ? 'PLACE ORDER' : 'PAY & PLACE ORDER'} 
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
        <TermsAndConditions open={termsAndConditionDialogOpen} onClose={handleTermsAndCondiDialogClose} onAgree={handleAgree}/>
        <GCash open={gCashDialogOpen} onClose={handleGcashQRCodeClose} />
        <Paymaya open={paymayaDialogOpen} onClose={handlePaymayaQRCodeClose} />
        <Dialog open={dialoOpen} onClose={handleDialogClose} maxWidth="md" fullWidth PaperProps={{ style: { maxHeight: '100vh' } }}>
            <div>
              <OrderSuccess onClose={handleDialogClose} timeStamp={orderTimeStamp}/>
            </div>
        </Dialog>
        <Footer/>
        </>
      )}
    </div>
  );
}

export default Checkout;