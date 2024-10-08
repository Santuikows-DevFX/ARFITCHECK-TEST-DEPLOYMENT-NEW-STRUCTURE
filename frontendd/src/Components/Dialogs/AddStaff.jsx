import React, { useState } from 'react';
import { Formik, Form, Field, } from 'formik';
import * as Yup from 'yup';
import { Grid, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider, InputAdornment, IconButton, TextField, FormHelperText } from '@mui/material';
import StyledTextFields from '../../Components/UI/TextFields';
import {Warning, Visibility, VisibilityOff, Close } from '@mui/icons-material';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

import Swal from 'sweetalert2'
import axiosClient from '../../axios-client';

const AddStaff = ({ open, onClose, fetchAdminInfo, zIndex }) => {
  const StaffValidationSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    eMail: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    confirmpassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
    mobileNum: Yup.string()
      .matches(/^[0-9]{10}$/, {
        message: 'Mobile Number must be only numeric characters and consists of 11 digits',
        excludeEmptyString: true,
      })
      .required('Mobile Number is required'),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleAddAdmin = (values) => {
    try {

      const adminData = new FormData()
      adminData.append('firstName', values.firstName)
      adminData.append('lastName', values.lastName)
      adminData.append('email', values.eMail)
      adminData.append('password', values.password)
      adminData.append('mobileNumber', values.mobileNum)

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

          axiosClient.post('auth/addAdmin', adminData)
          .then(({data}) => {

            if(data.message === 'Admin Added Successfully!') { 
              toast.success(`${data.message}`, {
                position: "top-right",
                autoClose: 2300,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                style: { fontFamily: 'Kanit', fontSize: '16px' }
              });

              fetchAdminInfo()

            }else { 

              toast.error(`${data.message}`, {
                position: "top-right",
                autoClose: 2300,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                style: { fontFamily: 'Kanit', fontSize: '16px' }
              });
            }
          }) 
        }
      });

    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div>
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
          initialValues={{ firstName: '', lastName: '', eMail: '', mobileNum: '', password : ''}}
          validationSchema={StaffValidationSchema}
          onSubmit={(values, { setSubmitting }) => {

            handleAddAdmin(values)
            setSubmitting(false);

          }}
        >
          {({ isSubmitting, isValid }) => (
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
                <Field name="confirmpassword">
                  {({ field, meta }) => (
                    <div>
                    <TextField
                        {...field}
                        id="confirmpassword"
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
                <Button onClick={onClose}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
                    Cancel
                  </Typography>
                </Button>
                <Button  type = 'submit' color="primary" disabled={isSubmitting || !isValid}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black'}}>
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