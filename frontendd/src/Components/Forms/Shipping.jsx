import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { Grid, MenuItem, Typography, Accordion, AccordionSummary, AccordionDetails, Box, FormControl, InputLabel, Select, CircularProgress, Button, Autocomplete, TextField, FormHelperText } from '@mui/material';
import StyledTextFields from '../UI/TextFields';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as Yup from 'yup';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useSnackbar } from 'notistack';

const countryOptions = ['Philippines'];

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

const barangayOptions = [
  'Barangay Baritan', 'Barangay Bayan-bayanan', 'Barangay Catmon', 
  'Barangay Concepcion', 'Barangay Dampalit', 'Barangay Flores', 
  'Barangay Hulong Duhat', 'Barangay Ibaba', 'Barangay Longos', 
  'Barangay Maysilo', 'Barangay Bagumbayan North', 'Barangay Bagumbayan South', 
  'Barangay Bangculasi', 'Barangay Daanghari', 'Barangay Navotas East', 
  'Barangay Navotas West', 'Barangay North Bay Boulevard North', 
  'Barangay North Bay Boulevard South', 'Barangay San Jose', 
  'Barangay San Roque', 'Marulas'
];

function Shipping() {
  const [shippingDetails, setShippingDetails] = useState([]);
  const [userDetails, setUserDetails] = useState([]);

  const [editableRecipientName, setEditableRecipientName] = useState(false);
  const [editableAddress, setEditableAddress] = useState(false);
  const [editablePostalCode, setEditablePostalCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [disableWhenUpdating, setDisbaleWhenUpdating] = useState(false) 

  const [cookie] = useCookies(['?id']);
  const { enqueueSnackbar  } = useSnackbar();

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

  const handleUpdateShippingDetails = async (values) => {
    try{

      setLoading(true);
      setDisbaleWhenUpdating(true)

      await axiosClient.post(`auth/updateShippingDetails/${cookie['?id']}`, values)
      .then(({data}) => {

        setTimeout(() => {
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

        fetchShippingDetails()

          setLoading(false); 
          setDisbaleWhenUpdating(false)
        }, 2000);
      })

    }catch(error){
      console.log(error);
    }
  } 

  const validationSchema = Yup.object().shape({
    recipientName: Yup.string()
    .matches(/^[A-Za-z\s-]+$/, 'First Name must contain only letters, spaces, or hyphens')
    .required('First Name is required'),
    city: Yup.string().required('City is required'),
    barangay: Yup.string().required('Barangay is required'),
    address: Yup.string().required('Address Line is required'),
    postalCode: Yup.string().required('Zip Code is required')
    .test('is-numeric', 'Zip code musbe a number must be a number', (value) => /^\d+$/.test(value)),
    province:  Yup.string().required('Province is required'),
  });

  return (
   <div>
      <Box m={2}>
      <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 20, md: 40 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
            Shipping Settings
          </Typography>
        <Accordion sx={{  background: 'linear-gradient(to right, #D7E1EC  , #FFFFFF)', marginBottom: '1%', borderRadius: '10px',  boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.4)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} >
            <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 20, md: 25 }, fontWeight: 'bold', color: 'black'}}>
              Shipping Details <br/>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 15 }, fontWeight: '300', color: 'black' }}>
                Update your shipping details.
              </Typography>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Formik
          enableReinitialize
          initialValues={{
            recipientName: shippingDetails.recipientName|| '',
            address: shippingDetails.addressLine || '',
            city: shippingDetails.city || '',
            barangay: shippingDetails.barangay || '',
            province: shippingDetails.province || '',
            postalCode: shippingDetails.postalCode || '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {

            handleUpdateShippingDetails(values)
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, values, isValid }) => (
            <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Field name="recipientName">
                        {({ field, meta }) => (
                          <StyledTextFields
                            field={{
                              ...field,
                              value: field.value
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
                              <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                                {meta.error}
                              </FormHelperText>
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
                              value: field.value
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
                        {({ field, form, meta }) => (
                          <FormControl fullWidth variant="filled">
                            <Autocomplete
                              {...field}
                              id="city"
                              options={cityOptions}
                              getOptionLabel={(option) => option}
                              fullWidth
                              disabled={disableWhenUpdating}
                              onChange={(event, value) => form.setFieldValue(field.name, value)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="City / Municipality"
                                  variant="filled"
                                  sx={{
                                    '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                  }}
                                  error={meta.touched && meta.error}
                                  InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                  
                                />
                              )}
                              renderOption={(props, option) => (
                                <MenuItem {...props} key={option} value={option}>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'black' }}>
                                    {option}
                                  </Typography>
                                </MenuItem>
                              )}
                            />
                            {meta.touched && meta.error && (
                              <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                                {meta.error}
                              </FormHelperText>
                            )}
                          </FormControl>
                        )}
                      </Field>
                    </Grid>

                    <Grid item xs={6}>
                      <Field name="barangay">
                        {({ field, meta, form }) => (
                          <FormControl fullWidth variant='filled'>
                            <Autocomplete
                              {...field}
                              id="barangay"
                              options={barangayOptions}
                              getOptionLabel={(option) => option}
                              fullWidth
                              disabled={disableWhenUpdating}
                              onChange={(event, value) => form.setFieldValue(field.name, value)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Barangay"
                                  variant="filled"
                                  sx={{
                                    '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                  }}
                                  error={meta.touched && meta.error}
                                  InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                  
                                />
                              )}
                              renderOption={(props, option) => (
                                <MenuItem {...props} key={option} value={option}>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'black' }}>
                                    {option}
                                  </Typography>
                                </MenuItem>
                              )}
                           />
                            {meta.touched && meta.error && (
                              <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                                {meta.error}
                              </FormHelperText>
                            )}
                          </FormControl>
                          
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
                              fullWidth
                              disabled={disableWhenUpdating}
                              onChange={(event, value) => form.setFieldValue(field.name, value)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Province"
                                  variant="filled"
                                  sx={{
                                    '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                  }}
                                  error={meta.touched && meta.error}
                                  InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                                  
                                />
                              )}
                              renderOption={(props, option) => (
                                <MenuItem {...props} key={option} value={option}>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, color: 'black' }}>
                                    {option}
                                  </Typography>
                                </MenuItem>
                              )}
                            />
                            {meta.touched && meta.error && (
                              <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                                {meta.error}
                              </FormHelperText>
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
                              value: field.value
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
                        background: 'linear-gradient(to right, #414141  , #000000)',
                        opacity: !isValid || loading || isSubmitting ? 0.7 : 1
                      }}
                      disabled = {isSubmitting || loading || !isValid}
                    >
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs: 12, md: 20 },
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