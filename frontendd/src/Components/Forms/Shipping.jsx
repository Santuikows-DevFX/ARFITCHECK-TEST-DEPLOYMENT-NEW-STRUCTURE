import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Grid, MenuItem, Typography, Accordion, AccordionSummary, AccordionDetails, Box, FormControl, InputLabel, Select, CircularProgress, Button } from '@mui/material';
import StyledTextFields from '../UI/TextFields';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FilledButton } from '../UI/Buttons';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

const provinceOptions = ['Metro Manila'];
const cityoOptions = ['Valenzuela'];
const barangayOptions = ['Marulas', 'Maam khae'];
const countryOptions = ['Philippines'];

function Shipping() {
  const [shippingDetails, setShippingDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const [editableRecipientName, setEditableRecipientName] = useState(false);
  const [editableAddress, setEditableAddress] = useState(false);
  const [editablePostalCode, setEditablePostalCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [disableWhenUpdating, setDisbaleWhenUpdating] = useState(false) 

  const [cookie] = useCookies(['?id']);

  useEffect(() => {
    fetchShippingDetails();
  }, []);


  const fetchShippingDetails = async () => {
    try {
      const shippingDetailsResponse = await axiosClient.get(`auth/getMyAddress/${cookie['?id']}`);
      const userDetailsResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);

      if (shippingDetailsResponse.data && userDetailsResponse.data) {
        setShippingDetails(shippingDetailsResponse.data);
        setUserDetails(userDetailsResponse.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRecipientNameClick = () => {
    setEditableRecipientName(true);
  };

  const handleAddressClick = () => {
    setEditableAddress(true);
  };

  const handlePostalCodeClick = () => {
    setEditablePostalCode(true);
  };

  const handleUpdateShippingDetails = async (values) => {
    try{

      setLoading(true);
      setDisbaleWhenUpdating(true)

      await axiosClient.post(`auth/updateShippingDetails/${cookie['?id']}`, values)
      .then(({data}) => {

        setTimeout(() => {
          toast.success(`${data.message}`, {
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

        fetchShippingDetails()

          setLoading(false); 
          setDisbaleWhenUpdating(false)
        }, 2000);
      })

    }catch(error){
      console.log(error);
    }
  } 

  return (
   <div>
      <Box m={2} height="100vh">
      <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 20, md: 40 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
            Shipping Settings
          </Typography>
        <Accordion sx={{  background: 'linear-gradient(to right, #D7E1EC  , #FFFFFF)', marginBottom: '1%', borderRadius: '10px',  boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.4)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} >
            <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 20, md: 25 }, fontWeight: 'bold', color: 'black'}}>
              Shipping Details <br/>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, fontWeight: '300', color: 'black' }}>
                Update your shipping details.
              </Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Formik
          enableReinitialize
          initialValues={{
            recipientName: shippingDetails.recipientName|| '',
            email: userDetails.email || '',
            address: shippingDetails.addressLine || '',
            city: shippingDetails.city || '',
            barangay: shippingDetails.barangay || '',
            province: shippingDetails.province || '',
            postalCode: shippingDetails.postalCode || '',
            }}
          onSubmit={(values, { setSubmitting }) => {

            handleUpdateShippingDetails(values)
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, values }) => (
            <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field name="recipientName">
                        {({ field, meta }) => (
                          <StyledTextFields
                            field={{
                              ...field,
                              value: editableRecipientName ? field.value : `${shippingDetails.recipientName}`,
                              onChange: (e) => field.onChange(e),
                              onClick: handleRecipientNameClick,
                              onBlur: () => setEditableRecipientName(false)
                            }}
                            meta={meta}
                            id="recipientName"
                            label="Recipient"
                            disabled={disableWhenUpdating}

                          />
                        )}
                      </Field>
                    </Grid>
                    <Grid item xs={12}>
                      <Field name="country">
                        {({ field, meta }) => (
                          <FormControl fullWidth variant="filled">
                            <InputLabel htmlFor="country" sx={{ fontFamily: 'Kanit' }}>Country</InputLabel>
                            <Select
                              {...field}
                              inputProps={{
                                id: 'country',
                              }}
                              fullWidth
                              value= 'Philippines'
                              error={meta.touched && meta.error}
                              disabled={true}
                            
                            >
                              {countryOptions.map((option) => (
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
                              value: editableAddress ? field.value : `${shippingDetails.addressLine}`,
                              onChange: (e) => field.onChange(e),
                              onClick: handleAddressClick,
                              onBlur: () => setEditableAddress(false)
                            }}
                            meta={meta}
                            id="address"
                            label="Address Line"
                            disabled={disableWhenUpdating}
                          
                          />
                        )}
                      </Field>
                    </Grid>
                    <Grid item xs={6}>
                      <Field name="city">
                        {({ field, meta }) => (
                          <FormControl fullWidth variant="filled">
                            <InputLabel htmlFor="city" sx={{ fontFamily: 'Kanit' }}>City / Municipality</InputLabel>
                            <Select
                              {...field}
                              inputProps={{
                                id: 'city',
                              }}
                              fullWidth
                              error={meta.touched && meta.error}
                              disabled={disableWhenUpdating}
                            >
                              {cityoOptions.map((option) => (
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
                    <Grid item xs={6}>
                      <Field name="barangay">
                        {({ field, meta }) => (
                          <FormControl fullWidth variant="filled">
                            <InputLabel htmlFor="city" sx={{ fontFamily: 'Kanit' }}>Barangay</InputLabel>
                            <Select
                              {...field}
                              inputProps={{
                                id: 'barangay',
                              }}
                              fullWidth
                              error={meta.touched && meta.error}
                              disabled={disableWhenUpdating}
                            >
                              {barangayOptions.map((option) => (
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
                      <Field name="province">
                        {({ field, meta }) => (
                          <FormControl fullWidth variant="filled">
                            <InputLabel htmlFor="province" sx={{ fontFamily: 'Kanit' }}>Province</InputLabel>
                            <Select
                              {...field}
                              inputProps={{
                                id: 'province',
                              }}
                              fullWidth
                              error={meta.touched && meta.error}
                              disabled={disableWhenUpdating}
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
                      <Field name="postalCode">
                        {({ field, meta }) => (
                          <StyledTextFields
                            field={{
                              ...field,
                              value: editablePostalCode ? field.value : `${shippingDetails.postalCode}`,
                              onChange: (e) => field.onChange(e),
                              onClick: handlePostalCodeClick,
                              onBlur: () => setEditablePostalCode(false)
                            }}
                            meta={meta}
                            id="postalCode"
                            label="Postal Code"
                            disabled={disableWhenUpdating}
                          />
                        )}
                      </Field>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} marginTop= '20px'>
                    <Button
                      type="submit"
                      onClick={() => {
                        handleUpdateInformation(values)
                      }}
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: 'White',
                        '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                        '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                        background: 'linear-gradient(to right, #414141  , #000000)'
                      }}
                      disabled = {isSubmitting || loading}
                    >
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs: 18, md: 25 },
                        padding: 0.5,
                        visibility: loading ? 'hidden' : 'visible',
                      }}
                    >
                      UPDATE SHIPPING DETAILS
                    </Typography>
                    {loading && (
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
                  </Grid>
                </Form>
              )}
            </Formik>
          </AccordionDetails>
        </Accordion>
      </Box>
    <ToastContainer/>
   </div>
  );
}

export default Shipping;