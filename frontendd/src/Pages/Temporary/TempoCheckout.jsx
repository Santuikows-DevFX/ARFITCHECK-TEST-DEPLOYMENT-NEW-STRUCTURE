import React, { useEffect, useState } from 'react';
import { Container, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Button, Checkbox, FormControlLabel, Grid, Paper, CircularProgress } from '@mui/material';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { NavLink, useNavigate } from 'react-router-dom';

const TempoCheckout = () => {
  const [orderDetails, setOrderDetails] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [isLoading, setIsLoading] = useState(false);

  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [subTotal, setSubTotal] = useState('')

  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchShippingDetails();
  }, []);

  useEffect(() => {
    const subtotal = orderDetails.reduce((acc, item) => acc + (item.productPrice * item.productQuantity), 0);
    setSubTotal(subtotal);
  }, [orderDetails]);

  const fetchCartItems = async () => {
    try {
      const uid = {
        uid: cookie['?id']
      };
      const cartItems = await axiosClient.post('cart/getMyCartItems', uid);

      if(cartItems.data) {
        setOrderDetails(cartItems.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchShippingDetails = async () => {
    try {
      const shipping = await axiosClient.get(`auth/getMyAddress/${cookie['?id']}`);
      const userInfo = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      if (shipping.data && userInfo.data) {

        setCity(shipping.data.city);
        setCountry(shipping.data.country)
        setBarangay(shipping.data.barangay);
        setAddressLine(shipping.data.addressLine);
        setZipCode(shipping.data.postalCode);

        setFirstName(userInfo.data.firstName);
        setLastName(userInfo.data.lastName);
        setMobileNumber(userInfo.data.mobileNumber);
        setEmail(userInfo.data.email);

      }
    } catch (error) {
      console.log(error);
    }
  };


  const formik = useFormik({
    initialValues: {
      firstName: firstName,
      lastName: lastName,
      mobileNumber: mobileNumber,
      email: email,
      city: city,
      barangay: barangay,
      address: addressLine,
      postalCode: zipCode,
      receiptFile: null,
      subTotal: subTotal,
      agreement: false,
    },
    validationSchema: Yup.object().shape({
      firstName: Yup.string().required('First Name is required'),
      lastName: Yup.string().required('Last Name is required'),
      mobileNumber: Yup.string().required('Mobile Number is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      city: Yup.string().required('City is required'),
      barangay: Yup.string().required('Barangay is required'),
      address: Yup.string().required('Address is required'),
      postalCode: Yup.string().required('Postal Code is required'),
      receiptFile: Yup.mixed().required('Receipt file is required'),
      agreement: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
    }),
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('mobileNumber', values.mobileNumber);
        formData.append('email', values.email);
        formData.append('city', values.city);
        formData.append('barangay', values.barangay);
        formData.append('address', values.address);
        formData.append('postalCode', values.postalCode);
        formData.append('subTotal', subTotal);
        formData.append('receiptFile', values.receiptFile);
        formData.append('uid', cookie['?id']);

        await axiosClient.post('order/placeOrder', formData);
        setTimeout(() => {
          setIsLoading(false);
          navigate('/ordersuccess')
        }, 1500);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    },
  });
  
  return (
    <Container maxWidth="md" style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', marginTop: '50px' }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h4" gutterBottom><b>Shipping Details</b></Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  margin="normal"
                  required={firstName === ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  margin="normal"
                  required={lastName === ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="mobileNumber"
                  label="Mobile Number"
                  value={formik.values.mobileNumber}
                  onChange={formik.handleChange}
                  error={formik.touched.mobileNumber && Boolean(formik.errors.mobileNumber)}
                  helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
                  margin="normal"
                  required={mobileNumber === ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  type="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  margin="normal"
                  required={email === ''}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>City</InputLabel>
                  <Select
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    required={city === ''}
                  >
                    <MenuItem value={city}>{city}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={12}>
                <TextField
                  fullWidth
                  name="barangay"
                  label="Barangay"
                  value={formik.values.barangay}
                  onChange={formik.handleChange}
                  error={formik.touched.barangay && Boolean(formik.errors.barangay)}
                  helperText={formik.touched.barangay && formik.errors.barangay}
                  margin="normal"
                  required={barangay === ''}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  multiline
                  rows={4}
                  value={formik.values.addressLine}
                  onChange={formik.handleChange}
                  error={formik.touched.address && Boolean(formik.errors.address)}
                  helperText={formik.touched.address && formik.errors.address}
                  margin="normal"
                  required={addressLine === ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="postalCode"
                  label="Zip Code"
                  value={formik.values.zipCode}
                  onChange={formik.handleChange}
                  error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                  helperText={formik.touched.postalCode && formik.errors.postalCode}
                  margin="normal"
                  required={zipCode === ''}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper style={{ padding: '20px' }}>
              <Typography variant="h6" gutterBottom>Order Details</Typography>
              {orderDetails.map((product) => (
                <Typography variant="body1" key={product.productId}>
                  {product.productName} - PHP {product.productPrice} x {product.productQuantity}
                </Typography>
              ))}
              <Typography variant="body1">Subtotal: PHP {subTotal}</Typography>
              <Typography variant="body1">Shipping: PHP 80</Typography>
              <Typography variant="h6" gutterBottom>Total: PHP {(subTotal + 80)}</Typography>
              <Typography variant="body2" gutterBottom>You can pay with your e-wallets online payments such as Gcash.</Typography>
              <Grid item xs={12} sm={12}>
                <input
                  type="file"
                  accept="image/*"
                  name="receiptFile"
                  onChange={(event) => {
                    formik.setFieldValue("receiptFile", event.currentTarget.files[0]);
                  }}
                  required={!formik.values.receiptFile}
                />
              </Grid>
              <FormControlLabel
                control={<Checkbox
                  name="agreement"
                  checked={formik.values.agreement}
                  onChange={formik.handleChange}
                  error={formik.touched.agreement && Boolean(formik.errors.agreement)}
                />}
                label="I agree to the terms and conditions"
              />
              {formik.touched.agreement && formik.errors.agreement && (
                <Typography color="error">{formik.errors.agreement}</Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                disabled={!formik.isValid ||  isLoading}
                type="submit"
                endIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                Proceed to Online Payment
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
}

export default TempoCheckout;
