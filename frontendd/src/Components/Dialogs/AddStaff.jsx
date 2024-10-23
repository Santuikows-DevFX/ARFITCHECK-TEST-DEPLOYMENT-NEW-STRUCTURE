import React, { useState } from 'react';
import { Formik, Form, Field, } from 'formik';
import * as Yup from 'yup';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, InputAdornment, IconButton, TextField, FormHelperText, Backdrop, CircularProgress } from '@mui/material';
import StyledTextFields from '../../Components/UI/TextFields';
import {Warning, Visibility, VisibilityOff, Close } from '@mui/icons-material';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

import Swal from 'sweetalert2'
import axiosClient from '../../axios-client';
import { useSnackbar } from 'notistack';

const AddStaff = ({ open, onClose, fetchAdminInfo, zIndex }) => {

  const StaffValidationSchema = Yup.object().shape({
    firstName: Yup.string()
    .matches(/^[A-Za-z\s-]+$/, 'First Name must contain only letters, spaces, or hyphens')
    .required('First Name is required'),
    lastName: Yup.string()
    .matches(/^[A-Za-z\s-]+$/, 'Last Name must contain only letters, spaces, or hyphens')
    .required('Last Name is required'),
    eMail: Yup.string()
      .email('Invalid email')
      .matches(
        /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|caloocan\.sti\.edu\.ph)$/,
        'Email must be a valid email from Gmail or Outlook'
      )
      .required('Email is required'),
     password: Yup.string()
      .required('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, 'Password can only contain alphanumeric characters and safe special characters')
      .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    mobileNum: Yup.string()
    .required('Mobile Number is required')
    .test('is-numeric', 'Mobile Number must be a number', (value) => /^\d+$/.test(value))
    .matches(/^\d{10}$/, 'Mobile Number must be exactly 10 digits and follow Philippine format')
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addAdminLoading, setAddAdminLoading] = useState(false);

  const { enqueueSnackbar  } = useSnackbar();

  const handleAddAdmin = (values) => {
    try {

      const adminData = new FormData()
      adminData.append('firstName', values.firstName)
      adminData.append('lastName', values.lastName)
      adminData.append('email', values.eMail)
      adminData.append('password', values.password)
      adminData.append('mobileNumber', `0${values.mobileNum}`)

      Swal.fire({
        title: "Add Admin",
        text: "The email must be verified before the admin log it in.",
        icon: "info",
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "I know",
        customClass: {
          container: 'sweet-alert-container',
        },
        didOpen: () => {
          document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
        }
      }).then((result) => {
        if (result.isConfirmed) {

          setAddAdminLoading(true)

          axiosClient.post('auth/addAdmin', adminData)
          .then(({data}) => {

            if(data.message === 'Admin Added Successfully!') { 
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

              setAddAdminLoading(false)
              fetchAdminInfo()
              onClose();

            }else { 

              enqueueSnackbar(`${data.message}`, { 
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

              setAddAdminLoading(false)

            }
          }) 
        }
      });

    } catch (error) {
      console.log(error);
      setAddAdminLoading(false)
    }
  }

  return (
    <div>
      {addAdminLoading && (
        <Backdrop open={true} style={{ zIndex: 1000 + 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </div>
        </Backdrop>
      )}
      <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }}>
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                  ADD ADMIN
              </Typography>
              <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <Divider sx={{ borderTopWidth: 0, mb : 1 , backgroundColor: 'black'}}/>
        <DialogContent>
          <Formik
            initialValues={{ firstName: '', lastName: '', eMail: '', mobileNum: '', password : '', confirmPassword: ''}}
            validationSchema={StaffValidationSchema}
            onSubmit={(values, { setSubmitting }) => {

              handleAddAdmin(values)
              setSubmitting(false);

            }}
          >
            {({ isSubmitting, isValid, values }) => (
              <Form>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="firstName">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="firstName" label="First Name" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="lastName">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="lastName" label="Last Name" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="eMail">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="eMail" label="Email" type= 'email' />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="mobileNum">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="mobileNum" label="Mobile Number" type= 'number'/>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 25, fontWeight: 'bold', color: 'black' }}>
                    SET ADMIN PASWORD
                  </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ borderTopWidth: 1, mb : 0, backgroundColor: 'black'}}/>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="password">
                    {({ field, meta }) => (
                      <div>
                      <TextField
                          {...field}
                          id="password"
                          label="Admin Password"
                          variant="filled"
                          fullWidth
                          type={showPassword ? "text" : "password"}
                          InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                          sx={{ '& input': { fontSize: 25, pt: 4 } }}
                          inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                          error={meta.touched && Boolean(meta.error)}
                          InputProps={{
                            endAdornment: (
                                <>
                                  <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                </>
                            )
                        }}
                      />
                      {meta.touched && meta.error && (
                          <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                              {meta.error}
                          </FormHelperText>
                      )}
                      </div>
                    )}
                    </Field>                     
                  </Grid>
                  <Grid item xs={12}>
                  <Field name="confirmPassword">
                    {({ field, meta }) => (
                      <div>
                      <TextField
                          {...field}
                          id="confirmPassword"
                          label="Admin Password Confirm"
                          variant="filled"
                          fullWidth
                          type={showConfirmPassword ? "text" : "password"}
                          InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                          sx={{ '& input': { fontSize: 25, pt: 4 } }}
                          inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                          error={meta.touched && Boolean(meta.error)}
                          InputProps={{
                            endAdornment: (
                                <>
                                  <InputAdornment position="end">
                                      <IconButton
                                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                                      >
                                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                      </IconButton>
                                  </InputAdornment>
                                </>
                            )
                        }}
                      />
                      {meta.touched && meta.error && (
                          <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                              {meta.error}
                          </FormHelperText>
                      )}
                      </div>
                    )}
                    </Field>     
                  </Grid>
                </Grid>
                <DialogActions>
                  <Button onClick={onClose} disabled = {isSubmitting || addAdminLoading}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
                      Cancel
                    </Typography>
                  </Button>
                  <Button 
                    type='submit' 
                    color="primary" 
                    disabled={isSubmitting || !isValid || Object.values(values).some(value => value === '') || addAdminLoading}
                  >
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: isSubmitting || !isValid || Object.values(values).some(value => value === '') || addAdminLoading ? 0.5 : 1 }}>
                      Add
                    </Typography>
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
      <ToastContainer/>
    </div>
  );
};

export default AddStaff;