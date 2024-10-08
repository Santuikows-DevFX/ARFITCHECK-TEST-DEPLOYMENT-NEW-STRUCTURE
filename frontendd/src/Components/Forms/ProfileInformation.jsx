import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Grid,Button, Typography, CircularProgress } from '@mui/material';
import StyledTextFields from '../../Components/UI/TextFields';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';

//mga wala si jeon
import Swal from 'sweetalert2'

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useStateContext } from '../../ContextAPI/ContextAPI';
import { useNavigate } from 'react-router-dom';
import VerifyPhone from '../Dialogs/VerifyPhone';

function ProfileInformation() {

  const [userInfo, setUserInfo] = useState([])
  const [cookie, removeCookie, remove, setCookie] = useCookies(['?sessiontoken', '?id', '?role']);
  const [loading, setLoading] = useState(false);
  const { setToken, setUserID, setRole } = useStateContext();

  const [openVerifyPhoneModal, setOpenVerifyPhoneModal] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('')

  const navigator = useNavigate();

  useEffect(() => {
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const userInfoResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`)
      setUserInfo(userInfoResponse.data)

    } catch (error) {
      console.log(error);
    }
  }

  const handleOpenVerifyPhoneModal = (email, phone) => {
    setOpenVerifyPhoneModal(true);
    setSelectedEmail(email);
    setSelectedPhone(phone)
  }
  const handleCloseVerifyPhoneModal = () => {
    setOpenVerifyPhoneModal(false)
    setLoading(false)
  }
  const handleUpdateInformation = (values) => {
    try {

      if(values.eMail != userInfo.email && values.mobileNum != userInfo.mobileNumber) {

        Swal.fire({
          title: "One at a time please.",
          text: "For verification purposes, kindly change email and password one at a time.",
          icon: "warning",
          showCancelButton: false,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#414a4c',
          confirmButtonText: "Okay",
        })

      }else if(values.eMail != userInfo.email) {
        Swal.fire({
          title: "Are you sure?",
          text: "Updating your email means you need to verify it again.",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#414a4c',
          confirmButtonText: "Yes, I'm Sure",
        }).then((result) => {
          if (result.isConfirmed) {
            updateInfo(values, 'newEmail')
          }
        });

      }else if(values.mobileNum != userInfo.mobileNumber) {
          Swal.fire({
            title: "Are you sure?",
            text: "Updating your phone means you need to verify it again.",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#414a4c',
            confirmButtonText: "Yes, I'm Sure",
          }).then((result) => {
            if (result.isConfirmed) {
              updateInfo(values, 'newPhone')
            }
          });
      }
      
    } catch (error) {
      console.log(error);
    }
  }

  const updateInfo = (values, requestType) => {
    setLoading(true);
    try {
      const newPersonalInfo = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: values.eMail,
        mobileNumber: values.mobileNum ? `0${values.mobileNum}` : 'None',
        requestType: requestType,
        uid: cookie['?id']
      }

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
  
            setLoading(false); 
            fetchUserInfo()

          }else if (data.message === 'VerifyPhone') {
             setOpenVerifyPhoneModal(true);
             handleOpenVerifyPhoneModal(values.eMail, values.mobileNum);
          }
          else if (data.message === 'Updated Successfully! Login with your new email') {

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
            setLoading(false);

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

            setLoading(false)
          }
          
        },2000)
      });
    } catch (error) {
      console.log(error);
    }
  }

  const ProfileValidationSchema = Yup.object().shape({
    eMail: Yup.string().email('Invalid email').required('Email is required'),
    mobileNum: Yup.string()
      .matches(/^[0-9]{10,11}$/, {  
        message: 'Mobile Number must be numeric and consist of 10 or 11 digits',
        excludeEmptyString: true,
      })
      .required('Mobile Number is required'),
});


  return (
    <div>
        <Formik
        enableReinitialize
        initialValues={{ 
          firstName: userInfo.firstName ? userInfo.firstName : '', 
          lastName: userInfo.lastName ? userInfo.lastName : '', 
          eMail: userInfo.email || '', 
          mobileNum: userInfo.mobileNumber || ''
        }}
        validationSchema={ProfileValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, values, isValid }) => (
          <Form>
            <Grid container spacing={2}>
              {/* FUll NAME */}
              <Grid item xs={12}>
                    <Field name="firstName">
                      {({ field, meta }) => (
                        <StyledTextFields
                            field={field}
                            meta={meta}
                            id="firstName"
                            label="First Name"
                            type="text"
                            value = {userInfo.firstName}
                            errorText={meta.touched && meta.error ? meta.error : ''}
                            fullWidth
                            disabled={true}
                            InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                            sx={{
                              '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                              backgroundColor: '#E0DFDF'
                            }}
                          />
                      )}
                    </Field>
              </Grid>
              <Grid item xs={12}>
                    <Field name="lastName">
                      {({ field, meta }) => (
                        <StyledTextFields
                        field={field}
                          meta={meta}
                          id="lastName"
                          label="Last Name"
                          type="text"
                          value = {userInfo.lastName}
                          disabled={true}
                          InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                          sx={{
                            '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                            backgroundColor: '#E0DFDF'
                          }}
                        />
                      )}
                    </Field>
              </Grid>
              {/* EMAIL && MOBILE NUM */}
              <Grid item xs={12} sm={6}>
                  <Field name="eMail">
                    {({ field, meta }) => (
                      <StyledTextFields
                        field={{ 
                          ...field,
                        }}
                        meta={meta}
                        id="eMail"
                        label="Email"
                        type="email"
                        errorText={meta.touched && meta.error ? meta.error : ''}
                        fullWidth
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                        sx={{
                          '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                          backgroundColor: '#E0DFDF'
                        }}
                      />
                    )}
                  </Field>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field name="mobileNum">
                  {({ field, meta }) => (
                    <StyledTextFields
                      field={{ 
                        ...field,
                      }}
                      meta={meta}
                      id="mobileNum"
                      label="Mobile Number"
                      type="number"
                      errorText={meta.touched && meta.error ? meta.error : ''}
                      fullWidth
                      InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                      sx={{
                        '& input': { pt: { xs: 2, sm: 2, md: 3 } },
                        backgroundColor: '#E0DFDF'
                      }}
                    />
                  )}
                </Field>
              </Grid>
              <Grid item xs={12}>
                <>
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
                    opacity: !isValid || isSubmitting || loading || (values.eMail === userInfo?.email && values.mobileNum === userInfo?.mobileNumber) ? 0.7 : 1,
                  }}
                  disabled = {!isValid || isSubmitting || loading || (values.eMail === userInfo?.email && values.mobileNum === userInfo?.mobileNumber)}

                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5, visibility: loading ? 'hidden' : 'visible' }}>UPDATE PROFILE INFORMATION</Typography>

                  {loading && (
                    <CircularProgress
                      size={24}
                      color="inherit"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        marginTop: "-12px",
                        marginLeft: "-12px",
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
      <VerifyPhone open={openVerifyPhoneModal} onClose={handleCloseVerifyPhoneModal} email={selectedEmail} mobilePhone={selectedPhone} fetchUserInfo={fetchUserInfo}/>
    </div>
  );
}
export default ProfileInformation;