import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, InputAdornment, IconButton, FormHelperText } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Close, Warning } from '@mui/icons-material';
import axiosClient from '../../axios-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import ResendCodeTimer from '../../WIdgets/ResendCodeTimer';
import { useCookies } from 'react-cookie';

const VerifyPhone = ({ open, onClose, email, mobilePhone, fetchUserInfo }) => {

  const [loading, setLoading] = useState(false);
  const [cookie, removeCookie, remove, setCookie] = useCookies(['?sessiontoken', '?id', '?role']);

  const validationSchema = Yup.object().shape({
    otpCode: Yup.string()
      .matches(/^[0-9]{6}$/, {
        message: 'OTP Code must be exactly 6 digits',
        excludeEmptyString: true,
      })
      .required('OTP Code is required'),
  });

  const INITIAL_FORM_STATE = {
    otpCode: '',
  };

  function censorPhoneNumber(phoneNumber) {
    const length = phoneNumber.length;
    const visibleLength = 6;
    if (length <= visibleLength) return phoneNumber; 
    const visiblePart = phoneNumber.slice(0, 3);
    const censoredPart = 'x'.repeat(length - visibleLength);
    const hiddenPart = phoneNumber.slice(-2);
    return visiblePart + censoredPart + hiddenPart;
  }

  const updateInfo = (values) => {
    
    // setLoading(true);
    try {
      const newPersonalInfo = {
        email: email,
        otpCode:values.otpCode,
        mobileNumber: `0${mobilePhone}`,
        requestType: 'verifyNewPhone',
        uid: cookie['?id']
      }

      console.log(newPersonalInfo);

      axiosClient.post('auth/updateProfile', newPersonalInfo)
      .then(({data}) => {

        setTimeout(() => {

          if(data.message === 'Updated Successfully!') {

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
  
            onClose();
            setLoading(false); 
            fetchUserInfo()

          }else {

            toast.error('Incorrect OTP Code!', {
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

            setLoading(false)
          }
          
        },2000)
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Formik
      initialValues={{ ...INITIAL_FORM_STATE }}
      validationSchema={validationSchema}
      onSubmit={updateInfo}
    >
      {({ values, isValid, resetForm, dirty }) => (
        <Form>
          <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" sx={{ 
            borderRadius: '5px', '& .MuiDialog-paper': { borderRadius: '16px' }}}>
            <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                VERIFY PHONE NUMBER
              </Typography>
              <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ fontFamily: 'Inter', marginBottom: 2, fontSize: { xs: 12, md: 20 } }}>
                A 6-digit code valid for <b>10 minutes</b> has been sent to <span style={{ fontWeight: 'bold' }}>{censorPhoneNumber(String(mobilePhone))}</span>. Please don't share the code with others, including the BMIC staff.
              </Typography>
              <Field name="otpCode">
                {({ field, meta }) => (
                  <div>
                    <TextField
                      {...field}
                      id="otpCode"
                      label="OTP Code"
                      variant="filled"
                      fullWidth
                      type="number"
                      InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                      sx={{
                        '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                        backgroundColor: '#E0DFDF'
                      }}
                      inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                      error={meta.touched && Boolean(meta.error)}
                      InputProps={{
                        endAdornment: meta.touched && meta.error ? (
                          <InputAdornment position="end">
                            <IconButton>
                              <Warning color="error" />
                            </IconButton>
                          </InputAdornment>
                        ) : null
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
              <ResendCodeTimer email={email} />
            </DialogContent>
            <DialogActions>
              <Button type="submit" color="primary" onClick={() => {
                  updateInfo(values)
              }} disabled={ !isValid || loading || String(values.otpCode).length === 0}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, fontWeight: '350', color: !isValid || loading  ? 'rgba(0, 0, 0, 0.38)' : 'black' }}>
                  Verify
                </Typography>
              </Button>
            </DialogActions>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

export default VerifyPhone;
