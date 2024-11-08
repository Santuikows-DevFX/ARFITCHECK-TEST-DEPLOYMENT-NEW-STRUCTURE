import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import axiosClient from "../axios-client.js";
import { useStateContext } from "../ContextAPI/ContextAPI.jsx";
import {
  Typography,
  Button,
  TextField,
  Grid,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Warning, Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../Components/Footer.jsx";
import PreLoader from "../Components/PreLoader.jsx";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import ForgotPassword from "../Components/Dialogs/ForgotPassword.jsx";
import Navbar from "../Widgets/Navbar.jsx";
import loginPic from '../../public/assets/log.png'
import loginGraffitiBG from '../../public/assets/loginGraffiti.png'
import icon from '../../public/assets/Icon.png'
import Swal from "sweetalert2";
import { useSnackbar } from "notistack";
import Zoom from "../WIdgets/Zoom.jsx";

function Login() {

  document.documentElement.style.setProperty('--primary', 'white');

  const [isLoading, setIsLoading] = useState(true);
  const [isLogginIn, setLogginIn] = useState(false);
  const [sessionLogin, setSessionLogin] = useState(false)
  const [showPassword, setShowPassword] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false)
  const { setUser, setToken, setUserID, setRole } = useStateContext();
  const [cookie, setCookie] = useCookies(["?sessiontoken", "?fn", "?id", "?role"]);

  const { enqueueSnackbar  } = useSnackbar();

  const navigator = useNavigate();

  useEffect(() => {

    if(cookie['?sessiontoken']) {
      setHasSession(true)
    }else {
      setHasSession(false)
    }

    AOS.init({
      duration: 1000,
      once: true,
    });

    const timeout = setTimeout(() => {
      setIsLoading(false);
      AOS.refreshHard();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [setIsLoading, cookie]);

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const INITIAL_FORM_STATE = {
    email: "",
    password: "",
  };

  const handleSubmit = (values) => {
    setLogginIn(true);
    
    try {

      axiosClient.post("/auth/loginUser", values).then(({ data }) => {
        if (data.token) {

          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + 24 * 60 * 60 * 1000); // this means that this cookie expires in 24 hours || 1 day

          setUser(data.firstName);
          setToken(data.token);
          setUserID(data.userID);
          setRole(data.role);

          setCookie("?sessiontoken", data.token, {
            path: "/",
            expires: expirationDate,
          });
          
          setCookie("?id", data.userID, { path: "/", expires: expirationDate });
          setCookie("?role", data.role, { path: "/", expires: expirationDate });
          setCookie("?fn", data.firstName, { path: "/", expires: expirationDate });

        } else {

          setLogginIn(false);
          enqueueSnackbar(`${data.message}`, { 
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
        }
      });
      
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleLoginWhenThereIsSession = () => {
    setSessionLogin(true)
    try {

      if(cookie['?sessiontoken']) {
        setTimeout(() => {

          setToken(cookie['?sessiontoken'])
          setRole(cookie['?role'])
          setUserID(cookie['?id'])
          
        }, 1500)

      }else {
        enqueueSnackbar(`${data.message}`, { 
          variant: 'error',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          },
          autoHideDuration: 1800,
          style: {
            fontFamily: 'Kanit'
          },
          onClose: () => {
            setSessionLogin(false)
            navigator('/login', { replace: true } )
          }
        });
      }
    }catch(error) {
      console.log(error);
      
    }
  }

  const handleLoginToDiffAccount = () => {

    setHasSession(false)

  }

  const handleOpenForgotPassword = () => {
    setIsDialogOpen(true);
  };

  const handleCloseForgotPassword = () => {
 
    setIsDialogOpen(false);
    
  };

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <div>
          <Navbar />
          <Formik
            initialValues={INITIAL_FORM_STATE}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
          {({ isValid, values }) => (
                <Form>
                <Grid
                  container
                  spacing={0}
                  rowGap={0}
                  sx={{ pt: { xs: 2, md: "5vh" } }}
                >
                  <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                      backgroundColor: "#e0e0e0",
                      height: { xs: "40vh", sm: "40vh", md: "95vh" },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={loginPic}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                      }}
                      alt="Login"
                    />
                  </Grid>
                  <Grid
                    item
                    container
                    xs={12}
                    md={6}
                    sx={{
                      backgroundImage: `url(${loginGraffitiBG})`,
                      backgroundSize: "cover",
                      backgroundRepeat: "no-repeat",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Grid
                      item
                      container
                      xs={12}
                      direction="row"
                      sx={{ alignItems: "center", justifyContent: "center" }}
                      rowGap={4.5}
                    >
                      <Grid
                        item
                        xs={10}
                        sx={{ display: "flex", justifyContent: "center" }}
                        data-aos="fade-up"
                      >
                        <img
                          src={icon}
                          style={{
                            width: "20%",
                            height: "20%",
                            objectFit: "contain",
                            marginTop: 20,
                          }}
                          alt="Icon"
                        />
                      </Grid>

                      {hasSession ? (
                        <>
                          {/* login button if has session*/}
                          <Grid item xs={10} data-aos="fade-up" data-aos-delay="600">
                            <Button
                              type="submit"
                              fullWidth
                              disabled = {sessionLogin}
                              onClick={handleLoginWhenThereIsSession}
                              variant="contained"
                              sx={{
                                backgroundColor: "White",
                                "&:hover": {
                                  backgroundColor: "#414a4c",
                                  color: "white",
                                },
                                "&:not(:hover)": {
                                  backgroundColor: "#3d4242",
                                  color: "white",
                                },
                                background:
                                  "linear-gradient(to right, #414141, #000000)",
                                opacity: sessionLogin  ? 0.7 : 1,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Kanit",
                                  fontSize: { xs: 18, md: 22 },
                                  padding: 0.5,
                                  visibility: sessionLogin ? "hidden" : "visible",
                                }}
                              >
                                LOG-IN AS {cookie['?fn']}
                              </Typography>

                              {sessionLogin && (
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
                          
                          {/* login to diff account */}
                          <Grid item xs={10} data-aos="fade-up" data-aos-delay="800">
                            <Typography
                              align="center"
                              style={{
                                textDecoration: "none",
                                color: "black",
                                fontWeight: 500,
                                cursor: "pointer",
                                fontFamily: 'Kanit'
                              }}
                              onClick={() => {
                                handleLoginToDiffAccount();
                              }}
                            >
                              Login using different account
                            </Typography>
                          </Grid>
                        </>
                      ) : (
                        <>
                           {/* email input */}
                           <Grid item xs={10} data-aos="fade-up" data-aos-delay="200">
                            <Field name="email">
                              {({ field, meta }) => (
                                <div>
                                  <TextField
                                    {...field}
                                    id="email"
                                    label="Email"
                                    variant="filled"
                                    fullWidth
                                    type="email"
                                    InputLabelProps={{
                                      sx: {
                                        fontFamily: "Kanit",
                                        fontSize: { xs: 12, md: 20 },
                                      },
                                    }}
                                    sx={{
                                      "& input": {
                                        pt: { xs: 2, sm: 2, md: 3 },
                                        fontFamily: "Kanit",
                                      },
                                      backgroundColor: "#E0DFDF",
                                    }}
                                  />
                                </div>
                              )}
                            </Field>
                          </Grid>

                          {/* password input */}
                          <Grid item xs={10} data-aos="fade-up" data-aos-delay="400">
                            <Field name="password">
                              {({ field, meta }) => (
                                <div>
                                  <TextField
                                    {...field}
                                    id="password"
                                    label="Password"
                                    variant="filled"
                                    fullWidth
                                    InputLabelProps={{
                                      sx: {
                                        fontFamily: "Kanit",
                                        fontSize: { xs: 12, md: 20 },
                                      },
                                    }}
                                    sx={{
                                      "& input": {
                                        pt: { xs: 2, sm: 2, md: 3 },
                                        fontFamily: "Kanit",
                                      },
                                      backgroundColor: "#E0DFDF",
                                    }}
                                    type={showPassword ? "text" : "password"}
                                    // error={meta.touched && Boolean(meta.error)}
                                    InputProps={{
                                      endAdornment: (
                                        <>
                                          <InputAdornment position="end">
                                              <IconButton
                                                onClick={() =>
                                                  setShowPassword((prev) => !prev)
                                                }
                                              >
                                                {showPassword ? (
                                                  <VisibilityOff />
                                                ) : (
                                                  <Visibility />
                                                )}
                                              </IconButton>
                                            </InputAdornment>
                                        </>
                                      ),
                                    }}
                                  />
                                </div>
                              )}
                            </Field>
                          </Grid>

                          {/* login button */}
                          <Grid item xs={10} data-aos="fade-up" data-aos-delay="600">
                            <Button
                              type="submit"
                              fullWidth
                              variant="contained"
                              disabled ={!isValid || isLogginIn || Object.values(values).some(value => value === '')}
                              sx={{
                                backgroundColor: "White",
                                "&:hover": {
                                  backgroundColor: "#414a4c",
                                  color: "white",
                                },
                                "&:not(:hover)": {
                                  backgroundColor: "#3d4242",
                                  color: "white",
                                },
                                background:
                                  "linear-gradient(to right, #414141, #000000)",
                                opacity: !isValid || isLogginIn || Object.values(values).some(value => value === '') ? 0.7 : 1, 
                              }}
                          
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Kanit",
                                  fontSize: { xs: 18, md: 22 },
                                  padding: 0.5,
                                  visibility: isLogginIn ? "hidden" : "visible",
                                }}
                              >
                                LOG-IN
                              </Typography>

                              {isLogginIn && (
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
                          
                          {/* Forgot password */}
                          <Grid item xs={10} data-aos="fade-up" data-aos-delay="800">
                            <Typography
                              align="center"
                              style={{
                                textDecoration: "none",
                                fontFamily: 'Kanit',
                                color: "black",
                                fontWeight: 'bold',
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleOpenForgotPassword();
                              }}
                            >
                              Forgot Password?
                            </Typography>
                          </Grid>
                        </>
                      )}

                      {/* signup if user dont have an account yet  */}
                      <Grid
                        item
                        xs={10}
                        data-aos="fade-up"
                        data-aos-delay="1000" 
                        sx={{ mb: 5 }}
                      >
                        <Typography align="center" sx={{ fontFamily: 'Kanit' }}>
                          Don't have an account yet?{" "}
                          <Link
                            to="/signup"
                            style={{
                              textDecoration: "none",
                              color: "black",
                              fontWeight: "bold",
                            }}
                          >
                            SIGN-UP
                          </Link>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Form>
          )}
          </Formik>
          <Footer />
          <ForgotPassword
            open={isDialogOpen}
            onClose={handleCloseForgotPassword}
          />
        </div>
      )}
    </div>
  );
}

export default Login;
