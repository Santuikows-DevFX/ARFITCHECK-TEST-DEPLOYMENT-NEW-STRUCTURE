import { Typography, Button, Checkbox, TextField, Grid, FormControlLabel, FormHelperText, InputAdornment, IconButton, CircularProgress, Menu, MenuItem, Box, Stepper, Step, StepLabel, Select, FormControl, InputLabel, Divider, Tooltip, Autocomplete } from '@mui/material';
import { Warning, Visibility, VisibilityOff } from '@mui/icons-material';
import Footer from '../Components/Footer.jsx';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import '../LogIn.css';

import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../axios-client.js';
import { useEffect, useState } from 'react';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import TermsAndConditions from './TermsAndConditions.jsx';

import AOS from 'aos';
import 'aos/dist/aos.css'
import { useStateContext } from '../ContextAPI/ContextAPI.jsx';
import { useCookies } from 'react-cookie';
import Navbar from '../Widgets/Navbar.jsx';
import SignupImage from '../../public/assets/Signup.png'
import phIcon from '../../public/assets/phIcon.png'
import signUpGraffitiBG from '../../public/assets/signupGraffiti.png'
import icon from '../../public/assets/Icon.png'


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

function SignUp() {

  const [isEulaChecked, setEulaChecked] = useState(false)
  const [isSignUp, setSignUp] = useState(false)
  const [activeStep, setActiveStep] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [enableNextIfErrInStep1, setEnableNextIfErrInStep1] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { setUser, setToken, setUserID } = useStateContext();
  const [cookie, setCookie] = useCookies(['?sessiontoken']);

  const navigator = useNavigate();

  const validationSchemaStep1 = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email')
      .matches(
        /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com|caloocan\.sti\.edu\.ph)$/,
        'Email must be a valid email from Gmail or Outlook'
      )
      .required('Email is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, 'Password can only contain alphanumeric characters and safe special characters')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
    confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
    mobilePhone: Yup.string()
      .required('Mobile phone is required')
      .test('is-numeric', 'Mobile phone must be a number', (value) => /^\d+$/.test(value))
      .matches(/^\d{10}$/, 'Mobile phone must be exactly 10 digits and follow Philippine format')

  });
  
  const validationSchemaStep2 = Yup.object().shape({
    city: Yup.string().required('City is required'),
    barangay: Yup.string().required('Barangay is required'),
    address: Yup.string().required('Address Line is required'),
    postalCode: Yup.string().required('Zip Code is required')
    .test('is-numeric', 'Zip code musbe a number must be a number', (value) => /^\d+$/.test(value)),
    province:  Yup.string().required('Province is required'),
  });

  const validationSchemaStep3 = Yup.object().shape({
    otpCode: Yup.string()
      .required('OTP Code is required')
      .matches(/^\d{6}$/, 'OTP Code must be exactly 6 digits'),
  });

  const INITIAL_FORM_STATE_STEP1 = {
    email: '', 
    fullName: '', 
    password: '', 
    confirmPassword: '',
    mobilePhone: ''
  }

  const INITIAL_FORM_STATE_STEP2 = {
    city: '', 
    barangay: '',
    address: '', 
    postalCode: '',
    province: ''
  }

  const INITIAL_FORM_STATE_STEP3 = {
    otpCode: '', 

  }

  const PhilippineIcon = () => (
    <img src= {phIcon} alt="Philippine Flag" style={{ width: 24, height: 24 }} />
  );
  
  function censorPhoneNumber(phoneNumber) {
    const length = phoneNumber.length;
    const visibleLength = 6;
    if (length <= visibleLength) return phoneNumber; 
    const visiblePart = phoneNumber.slice(0, 3);
    const censoredPart = 'x'.repeat(length - visibleLength);
    const hiddenPart = phoneNumber.slice(-2);
    return visiblePart + censoredPart + hiddenPart;
  }

  useEffect(() => {
    AOS.init({
    });
  }, [])

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  }

  const handleProceed = async (values, {resetForm}) => {

    try {

      setSignUp(true)

      const signUpRawData = {
        email: values.email,
        password: values.password,
        mobilePhone: '0' + values.mobilePhone,
        firstName: values.firstName,
        lastName: values.lastName,
        city: values.city,
        barangay: values.barangay,
        province: values.province,
        address: values.address,
        postalCode: values.postalCode,
        requestType: "VERIFY"
      };

      await axiosClient.post('auth/insertUser', signUpRawData)
      .then(({data}) => {

        if(data.message) {
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

          setSignUp(false)
          setEulaChecked(false)

        }else {

          setTimeout(() => {

            setActiveStep(activeStep + 1)
            setSignUp(false)
  
            setEulaChecked(false)
    
          }, 2000);
        }

      })

    } catch (error) {
      console.log(error);
    }
   
  }

  const handleSignUp = async (values, {resetForm}) => {

    try {

        setSignUp(true)
        await axiosClient.post('auth/insertUser', values)
        .then(({data}) => {

           if(data.message === 'Goods') { 

              resetForm()
              setSignUp(false)
              setEulaChecked(false)

              const expirationDate = new Date();
              expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000); // 1 hour

              setUser(data.userInfo);
              setToken(data.token);
              setUserID(data.userID);

              setCookie('?sessiontoken', data.token, { path: '/', expires: expirationDate });
              setCookie('?id', data.userID, { path: '/', expires: expirationDate });
              setCookie('?role', data.role, { path: '/', expires: expirationDate });
              
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
                  onClose: () => {
                    setSignUp(false)
                  },
                  style: { fontFamily: 'Kanit', fontSize: '16px' }
              });
           }
        })

    }catch(error) {
        console.log(error);
    }
  }

  const handleEulaCheck = () => {

    if(isEulaChecked) {
      setEulaChecked(false)
    }else {
      setEulaChecked(true)
    }
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setEnableNextIfErrInStep1(true)
  }

  const handleAgree = () => {
    setEulaChecked(true);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <Navbar/>
      <div className="body">
      <Formik
         initialValues={activeStep === 0 ? { ...INITIAL_FORM_STATE_STEP1 } : activeStep === 2 ? { ...INITIAL_FORM_STATE_STEP3 } : { ...INITIAL_FORM_STATE_STEP2 }}
         validationSchema={activeStep === 0 ? validationSchemaStep1 : activeStep === 2 ? validationSchemaStep3 : validationSchemaStep2}
         onSubmit={activeStep === 0 ? handleNext : activeStep === 2 ? handleSignUp : handleProceed}
      > 
        {({isValid, dirty, values}) => (
         <Form>
         <Grid container spacing={0}  sx={{ pt: '5vH' }}>
         <Grid item xs={12} md={6} sx={{
            backgroundColor: '#e0e0e0',
            height: { xs: '30vh', sm: '40vh', md: '95vh' },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src= {SignupImage}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              alt="Login"
            />
          </Grid>
          <Grid item container  xs={12} md={6} style={{ backgroundImage: `url(${signUpGraffitiBG})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', alignItems: "center", justifyContent: "center" }}>
            <Grid item container xs={12} direction="row" style={{ alignItems: "center", justifyContent: "center" }} rowGap={3.3}>
              <Grid item xs={10} style={{ display: 'flex', justifyContent: 'center' }} data-aos="fade-up">
                <img src={icon} style={{ width: '20%', height: '20%', objectFit: 'contain', marginTop: 20 }} alt="Icon" />
              </Grid>
              <Grid item xs={10} data-aos="fade-up" data-aos-delay="200">
                <Stepper activeStep={activeStep} alternativeLabel>
                  <Step>
                    <StepLabel>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                        Account Details
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                        Address Details
                      </Typography>
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } }}>
                        Verification
                      </Typography>
                    </StepLabel>
                  </Step>
                </Stepper>
              </Grid>
             {activeStep === 0 && (
              <>
               <Grid container spacing={2} item xs={10} direction="row">
                  <Grid item xs={6} data-aos="fade-up" data-aos-delay="400">
                    <Field name="firstName">
                      {({ field, meta }) => (
                        <div>
                          <TextField
                            {...field}
                            id="firstName"
                            label="First Name"
                            variant="filled"
                            fullWidth
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
                  </Grid>
                  <Grid item xs={6} data-aos="fade-up" data-aos-delay="600">
                    <Field name="lastName">
                      {({ field, meta }) => (
                        <div>
                          <TextField
                            {...field}
                            id="lastName"
                            label="Last Name"
                            variant="filled"
                            fullWidth
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
                            <FormHelperText sx={{ fontFamily: 'Kanit',fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                              {meta.error}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    </Field>
                  </Grid>
                </Grid>
                <Grid container spacing={2} item xs={10} direction="row">
                  <Grid item xs={6} data-aos="fade-up" data-aos-delay="400">
                    <Field name="email">
                      {({ field, meta }) => (
                        <div>
                          <TextField
                            {...field}
                            id="email"
                            label="Email"
                            variant="filled"
                            fullWidth
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
                  </Grid>
                  <Grid item xs={6} data-aos="fade-up" data-aos-delay="600">
                    <Field name="mobilePhone">
                      {({ field, meta }) => (
                        <div>
                           <TextField
                            {...field}
                            id="mobilePhone"
                            label="Mobile Number"
                            variant="filled"
                            fullWidth
                            InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                            sx={{
                              '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { md: 16 } },
                              backgroundColor: '#E0DFDF'
                            }}
                            inputProps={{
                              style: { fontSize: { xs: 12, md: 16 }, fontFamily: 'Kanit' }
                            }}
                            error={meta.touched && Boolean(meta.error)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                    <PhilippineIcon sx={{ fontSize: { xs: 16, md: 24 } }} /> 
                                    <span style={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, marginLeft: 4 }}>+63</span> 
                                </InputAdornment>
                              ),
                              endAdornment: meta.touched && meta.error ? (
                                <InputAdornment position="end">
                                  <IconButton>
                                    <Warning color="error" sx={{ fontSize: { xs: 16, md: 24 } }} /> 
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
                  </Grid>
                </Grid>
                  <Grid item xs={10} data-aos="fade-up" data-aos-delay="1200">
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
                            <FormHelperText sx={{ fontFamily: 'Kanit',  fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                              {meta.error}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={10} data-aos="fade-up" data-aos-delay="1400">
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
                            type={showConfirmPassword ? "text" : "password"}
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
                            <FormHelperText sx={{ fontFamily: 'Kanit',  fontSize: { xs: 10, md: 15 }, color: 'red' }}>
                              {meta.error}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={10} data-aos="fade-up" data-aos-delay="1600">
                    <Button
                      type='submit'
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: 'White',
                        '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                        '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                        opacity: enableNextIfErrInStep1 ? 1 : !dirty || !isValid ? 0.7 : 1
                      }}
                      disabled = {enableNextIfErrInStep1 ? false : !dirty || !isValid}
                    >
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5 }}>NEXT</Typography>
                    </Button>
                  </Grid>
                  <Grid item xs={10} data-aos="fade-up" data-aos-delay="1800" sx={{ mb: 5 }}>
                    <Typography  align="center" sx={{ fontFamily: 'Kanit' }}>
                    Already have an account? <Link to="/login" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>LOG-IN</Link>
                    </Typography>
                  </Grid>
              </>
             )}
             {activeStep === 1 && (
              <>
              {/* PROVINCE */}
               <Grid item xs={10} data-aos="fade-in">
               <Field name="province">
                      {({ field, meta }) => (
                    <div>
                    <FormControl fullWidth variant="filled" error={meta.touched && Boolean(meta.error)}>
                      <InputLabel id="province-label" sx={{ fontFamily: 'Kanit',fontSize: { xs: 12, md: 20 }}}>
                        Province
                      </InputLabel>
                      <Select
                        {...field}
                        labelId="province-label"
                        id="province"
                        label="Province"
                        value={field.value}
                        onChange={field.onChange}
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20, } }}
                        sx={{ 
                          '& .MuiSelect-select': { 
                            pb: { xs: 0, md: 0},
                            backgroundColor: '#E0DFDF',
                          },
                        }}
                      >
                        {provinceOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                              {option}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                      {meta.touched && meta.error && (
                        <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red', paddingTop: '5px' }}>
                          {meta.error}
                        </FormHelperText>
                      )}
                    </FormControl>
                  </div>
                      )}
                    </Field>
               </Grid>
              {/* CITY & BARANGAY */}
                <Grid container spacing={2} item xs={10} direction="row">
                  <Grid item xs={6} data-aos="fade-in" data-aos-delay="400">
                    <Field name="city">
                      {({ field, form, meta }) => (
                        <Autocomplete
                          id="city"
                          options={cityOptions}
                          getOptionLabel={(option) => option}
                          onChange={(event, value) => form.setFieldValue('city', value)}
                          value={field.value || null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="City / Municipality"
                              variant="filled"
                              error={meta.touched && Boolean(meta.error)}
                              InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                              sx={{
                                '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                backgroundColor: '#E0DFDF',
                              }}
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
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={6} data-aos="fade-in" data-aos-delay="600">
                    <Field name="barangay">
                      {({ field, form, meta }) => (
                        <Autocomplete
                          id="barangay"
                          options={barangayOptions}
                          getOptionLabel={(option) => option}
                          onChange={(event, value) => form.setFieldValue('barangay', value)}
                          value={field.value || null}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Barangay"
                              variant="filled"
                              error={meta.touched && Boolean(meta.error)}
                              InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 } } }}
                              sx={{
                                '& input': { pt: { xs: 2, sm: 2, md: 3 }, fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 } },
                                backgroundColor: '#E0DFDF',
                              }}
                              
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
                      )}
                    </Field>
                  </Grid>
                </Grid>
                {/* ADDRESS LINE */}
                  <Grid item xs={10} data-aos="fade-in" data-aos-delay="600">
                    <Field name="address">
                      {({ field, meta }) => (
                        <div>
                          <TextField
                            {...field}
                            id="address"
                            label="Address Line"
                            variant="filled"
                            fullWidth
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
                            <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                              {meta.error}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    </Field>
                  </Grid>
                  {/* POSTAL CODE */}
                  <Grid item xs={10} data-aos="fade-in" data-aos-delay="600">
                    <Field name="postalCode">
                      {({ field, meta }) => (
                        <div>
                          <TextField
                            {...field}
                            id="postalCode"
                            label="Zip Code"
                            variant="filled"
                            type='number'
                            fullWidth
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
                            <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red' }}>
                              {meta.error}
                            </FormHelperText>
                          )}
                        </div>
                      )}
                    </Field>
                  </Grid>    
                  {/* EULA */}
                  <Grid item xs={10} data-aos="fade-in" data-aos-delay="800">
                    <FormControlLabel
                      control={<Checkbox checked={isEulaChecked} onChange={handleEulaCheck} />}
                      label={
                        <Typography sx={{ fontFamily: 'Inter', display: 'flex', alignItems: 'center', fontSize: { xs: 12, md: 20 } }}>
                          I Agree with the&nbsp;
                          <span style={{ color: "#1A5276" }}>
                            <b onClick={(event) => {
                              event.preventDefault(); 
                              handleButtonClick();
                            }}>Terms and Conditions</b>
                          </span>
                        </Typography>

                      }
                      sx={{ fontFamily: 'Kanit', fontSize: 16 }}
                    />
                  </Grid>
                  {/* BUTTONS */}
                  <Grid container item xs={10} direction="row" justifyContent="space-between" data-aos="fade-in" data-aos-delay="1000" sx = {{pb: 5}}>
                    <Button
                      type="button"  
                      variant="outlined"
                      sx={{
                        width: '47%',
                        '&:hover': { borderColor: '#414a4c', backgroundColor: '#414a4c', color: 'white' },
                        '&:not(:hover)': { borderColor: '#3d4242', color: 'black' },
                      }}
                      onClick={handleBack} 
                    >
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5 }}>BACK</Typography>
                    </Button>
                    <Button
                      type="submit" 
                      variant="contained"
                      sx={{
                        width: '47%',
                        backgroundColor: 'White',
                        '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                        '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                        background: 'linear-gradient(to right, #414141, #000000)',
                        opacity: !isEulaChecked || !dirty || !isValid || isSignUp ? 0.7 : 1,
                      }}
                      disabled={ !isEulaChecked || !dirty || !isValid || isSignUp}
                    >
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5, cursor: 'pointer', visibility: isSignUp ? 'hidden' : 'visible' }}>SIGN UP</Typography>
                      {isSignUp && (
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
                  </Grid>
              </>
             )}
              {activeStep === 2 && (
                <Box
                  sx={{
                    backgroundColor: 'white',
                    p: 2,
                    width: '70%',
                    borderRadius: '12px',
                    background: 'linear-gradient(to right, #F5E3E6 , #D9E4F5)',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    marginBottom: '5%'
                  }}
                  data-aos="fade-up"
                  data-aos-delay="200"
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', marginBottom: 2,fontSize: { xs: 20, md: 30 } }}>
                      ACCOUNT VERIFICATION
                    </Typography>
                    <Divider sx={{ backgroundColor: 'black', width: '100%' }} />
                    <Box sx={{ marginBottom: 2 }}>
                      <Typography sx={{ fontFamily: 'Kanit', marginBottom: 2, marginTop: 2, textAlign: 'justify', fontSize: { xs: 12, md: 20 } }}>
                        You have successfully registered your account, A verification link is sent to <span style={{ fontWeight: 'bold' }}>{values.email}</span>. If you haven't received it, please wait a moment or check your spam folder.
                      </Typography>
                    </Box>
                    <Box sx={{ marginBottom: 2 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => {
                            navigator('/login');
                          }}
                          sx={{
                            width: '100%',
                            backgroundColor: 'White',
                            '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                            '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                            background: 'linear-gradient(to right, #414141, #000000)'
                          }}
                        >
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5, cursor: 'pointer' }}>BACK TO LOG-IN</Typography>
                        </Button>
                          {/* <ResendCodeTimer email={values.email}/> */}
                      </Box>
                    </Box>
                  </Box>
                </Box>
             )}
            </Grid>
          </Grid>
        </Grid>
          </Form>
        )}
      </Formik>
      <Footer />
    </div>
      <TermsAndConditions  open={isDialogOpen} onClose={handleDialogClose} onAgree={handleAgree} />
      <ToastContainer/>
    </div>
  );
}

export default SignUp;