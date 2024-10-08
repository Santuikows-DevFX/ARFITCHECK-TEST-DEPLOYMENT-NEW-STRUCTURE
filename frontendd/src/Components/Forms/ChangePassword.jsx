import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FilledButton } from '../../Components/UI/Buttons';
import StyledTextFields from '../../Components/UI/TextFields';
import { Grid, InputAdornment, IconButton, TextField, FormHelperText, CircularProgress, Button, Typography } from '@mui/material';
import { Warning, Visibility, VisibilityOff } from '@mui/icons-material';

import Swal from 'sweetalert2'

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../ContextAPI/ContextAPI';

const PasswordValidationSchema = Yup.object().shape({
  password: Yup.string().required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
  oldPassword: Yup.string().required('Old Password is required'),
});

function ChangePassword() {

  const [showPassword, setShowPassword] = useState(false);
  const [cookie, removeCookie, remove, setCookie] = useCookies(['?sessiontoken', '?id', '?role']);
  const [loading, setLoading] = useState(false);
  const { setToken, setUserID, setRole } = useStateContext();

  const handleChangePassword = (values) => {
    try {
      Swal.fire({
        title: "Are you sure?",
        text: "Changing your password requires relogging in.",
        icon: "warning",
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Yes, I'm Sure",
      }).then((result) => {
        if (result.isConfirmed) {
          updateInfo(values)
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const navigator = useNavigate()
  
  const updateInfo = (values) => {
    try {
  
      const newPassword = {
        oldPassword: values.oldPassword,
        newPassword: values.password,
        uid: cookie['?id']
      }
      setLoading(true)
      axiosClient.post('auth/updatePassword', newPassword)
      .then(({data}) => {
        setTimeout(() => {

          if(data.message === 'Password Updated Successfully!') {

            toast.success(`${data.message}`, {
              position: "top-right",
              autoClose: 1800,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              transition: Bounce,
              onClose: () => {

                remove('?id')
                remove('?sessiontoken')
                remove('?role')

                setToken(null)
                setRole(null)
                setUserID(null)

                navigator('/login')
              },
              style: { fontFamily: 'Kanit', fontSize: '16px' }
            });

          }else {

            toast.error(`${data.message}`, {
              position: "top-right",
              autoClose: 1800,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
              transition: Bounce,
              onClose: () => {
              },
              style: { fontFamily: 'Kanit', fontSize: '16px' }
            });
          }
          setLoading(false)
        }, 200)
      })
      
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <Formik
        initialValues={{ password: '', confirmPassword: '', oldPassword: '' }}
        validationSchema={PasswordValidationSchema}
        onSubmit={(values, { setSubmitting }) => {

          handleChangePassword(values)
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, isValid, values}) => (
          <Form>
            <Grid container spacing={2}>
            <Grid item xs={12}>
                <Field name="oldPassword">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        id="oldPassword"
                        label="Old Password"
                        variant="filled"
                        fullWidth
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                        type={showPassword ? "text" : "password"}
                        error={meta.touched && Boolean(meta.error)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {meta.touched && meta.error && (
                            <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                          {meta.error}
                        </FormHelperText>
                      )}
                    </div>
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <Field name="password">
                  {({ field, meta }) => (
                    <div>
                      <TextField
                        {...field}
                        id="password"
                        label="Password"
                        variant="filled"
                        fullWidth
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                        type={showPassword ? "text" : "password"}
                        error={meta.touched && Boolean(meta.error)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {meta.touched && meta.error && (
                        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
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
                        label="Confirm Password"
                        variant="filled"
                        fullWidth
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                        inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                        type={showPassword ? "text" : "password"}
                        error={meta.touched && Boolean(meta.error)}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {meta.touched && meta.error && (
                        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                          {meta.error}
                        </FormHelperText>
                      )}
                    </div>
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <>
                  <Button
                    type="submit"
                    onClick={() => {
                      handleChangePassword(values)
                    }}
                    fullWidth
                    variant="contained"
                    sx={{
                      backgroundColor: 'White',
                      '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                      '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                      opacity: isSubmitting || loading || !isValid || values.password.length === 0 || values.oldPassword.length === 0 || values.confirmPassword === 0 || values.password === values.oldPassword? 0.7 : 1,
                      background: 'linear-gradient(to right, #414141  , #000000)'

                    }}
                    disabled = {isSubmitting || loading || !isValid || values.password.length === 0 || values.oldPassword.length === 0 || values.confirmPassword === 0 || values.password === values.oldPassword}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs: 18, md: 25 },
                        padding: 0.5,
                        visibility: loading ? 'hidden' : 'visible',
                      }}
                    >
                      UPDATE PASSWORD
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
                </>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default ChangePassword;
