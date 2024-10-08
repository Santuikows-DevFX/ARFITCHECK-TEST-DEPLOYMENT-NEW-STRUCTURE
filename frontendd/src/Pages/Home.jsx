import React, { useEffect, useState } from 'react';
import { useStateContext } from '../ContextAPI/ContextAPI';
import axiosClient from '../axios-client';
import { useCookies } from 'react-cookie';
import { Typography, Pagination, Card, CardActionArea, CardContent, Box, Grid, CardMedia, IconButton, InputAdornment, TextField, FormHelperText, Button, Dialog } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../Components/Footer';
import PreLoader from '../Components/PreLoader';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Warning } from '@mui/icons-material';
import { FilledButton } from '../Components/UI/Buttons.jsx';
import Navbar from '../Widgets/Navbar.jsx';
import ProductDescription from './Customers/ProductDescription.jsx';

const Home = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const { user, setUser } = useStateContext();
  const [cookie] = useCookies(['?id', '?role']);
  const [isLoading, setIsLoading] = React.useState(true);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([])
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null)

  const navigator = useNavigate();

  document.documentElement.style.setProperty('--primary', 'white');
  const styles = {
    root: {
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("../public/assets/newsletter.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    },
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
  });

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchMyOrders();
  }, []);

  useEffect(() => {
    fetchCustomizationRequest();
  }, [])

  const fetchProducts = async () => {
    const response = await axiosClient.get(`prd/getProducts/${cookie['?role']}`);
    setDisplayProducts(response.data);
  };

  const fetchMyOrders = async () => {
    try {
      const myOrderResponse = await axiosClient.get(`order/fetchMyOrder/${cookie['?id']}`);

      myOrderResponse.data.map((dateDelivery) => {
        if(dateDelivery.orderInfo?.orderStatus === 'Parcel out for delivery' && dateDelivery?.orderID === dateDelivery.orderInfo?.associatedOrderID) {
          checkIfOrderDelivered(dateDelivery.orderInfo?.orderDateDelivery, dateDelivery.orderInfo?.associatedOrderID, dateDelivery.orderInfo?.isReceived)
        }
      })

    } catch (error) {
      console.log(error);
    }
  };

  const fetchCustomizationRequest = async () => {
    try {

      const customizedRequestResponse = await axiosClient.get(`/custom/fetchMyCustomizationRequests/${cookie['?id']}`)
      if (customizedRequestResponse.data) {
        customizedRequestResponse.data.map((customizedRequest) => {
          //we need to check the status first if its still on Request Approved and the isPaid is still false
          if (customizedRequest.orderInfo?.orderStatus === 'Request Approved' && !customizedRequest.orderInfo?.isPaid) {
            checkIfCustomRequestPassedThePaymentDate(customizedRequest.orderInfo?.approvedDate, customizedRequest?.orderID, customizedRequest.orderInfo?.isPaid)
          }     
        })     
      }

    }catch(error) {
      console.log(error);
    }
  }

  // TODO: CHECK IF NAGANA
  const checkIfCustomRequestPassedThePaymentDate = (approvedDate, requestID, isPaid) => {
    try {

      //yung araw na inupdate ni admin yung request as approved
      const approveDate = new Date(approvedDate)
      const currDate = new Date();

      const timeDiff = currDate.getTime() - approveDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);

      //check if the day diff is > 2 which means lagpas na siya sa 2 day policy natin
      if (dayDiff >= 2 && !isPaid) {
        handleAutomaticCancelCustomRequests({requestID, associatedOrderID: requestID, orderType: 'Cancel', cancelReason: 'User didn\'t pay in time'})
      } 

    }catch(error) {
      console.log(error);
      
    }
  }

  const handleAutomaticCancelCustomRequests = (requestData) => {
    try {
      axiosClient.post('/custom/updateRequest', requestData)
    } catch (error) {
      console.log(error);
    }
  }

  const checkIfOrderDelivered = (orderDateDelivery, orderID, isReceived) => {
    try {

      const deliveryDate = new Date(orderDateDelivery);
      const getCurrentDate = new Date();  

      const timeDiff = getCurrentDate.getTime() - deliveryDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24) // => 1 day = 1000 * 60 * 60 * 24

      //check natin if yung diff from curr date and updated date when delivered is est 1 day @ 8:30 something
      if (dayDiff > 1.55 && !isReceived) {
        handleAutomaticReceiveOrder({orderID, associatedOrderID: orderID})
      }

    }catch(error){
      console.log(error);
      
    }
  }

  const handleAutomaticReceiveOrder = async (receivedOrderData) => {
    try {
      await axiosClient.post('/order/receiveMyOrder', receivedOrderData);
    }catch(error) {
      console.log(error);
    }
  }

  const categories = [
    { name: 'T-SHIRTS', value: 'T-Shirt' },
    { name: 'SHORTS', value: 'Shorts' },
    { name: 'CAPS', value: 'Caps' },
    { name: 'HOODIES', value: 'Hoodies' },
  ];

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 900,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
   
  };

  const handleOpenProductDetails = (product) => {
    try{

      setSelectedProduct(product)      
      setModalOpen(true)

    }catch(error) {
      console.log(error);
    }
  }

  const handleCloseModal  = () => {
    setModalOpen(false)
  }

  const renderProductSlides = () => {
    return displayProducts.map(product => (
      <Card
        key={product.productID}
        sx={{ 
          width: { xs: '85%', sm: '80%', md: '90%' }, height: { xs: '15vmax', sm: '80%', md: '80%' }, cursor: 'pointer', margin: '0 10px',  
          transition: 'transform 0.2s ease', 
          '&:hover': {
            transform: 'scale(1.09)',
          },
        }} 
        onClick={() => handleOpenProductDetails(product.productInfo)}
      >
        <CardActionArea>
          <CardMedia
            component="img"
            sx={{ objectFit: 'cover', height: { xs: '10vh', sm: '10vh', md: '25vh' }, width: '100%' }}
            image={product.productInfo?.productImage}
            alt={product.productInfo?.productName}
          />
          <CardContent sx={{ overflow: 'hidden' }}>
            <Typography
              gutterBottom
              sx={{
                textDecoration: 'none',
                fontFamily: "Kanit",
                fontWeight: "bold",
                textAlign: "left",
                color: "black",
                fontSize: { xs: 10, sm: 20, md: 22 },
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {product.productInfo?.productName.toUpperCase()}
            </Typography>
            
            <Typography
              sx={{
                fontFamily: "Kanit",
                fontWeight: "medium",
                textAlign: "left",
                color: "black",
                fontSize: { xs: 10, sm: 16, md: 18 },
                marginTop: -1
              }}
            >
              ₱{parseFloat(product.productInfo?.productPrice).toFixed(2)} 
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    ));
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const renderAnnouncementContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <Box sx={{ width: '100%',height: { xs: '50%', sm: '40vh', md: '95vh' }, overflow: 'hidden' }}>
            <video autoPlay loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
              <source src="../public/assets/nigg/Ads.mp4" type="video/mp4" />
            </video>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ width: '100%', height: { xs: '60%', sm: '40vh', md: '95vh' }, overflow: 'hidden' }}>
            <img src="../public/assets/Announcement/Eventsv2.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <>
          <Navbar />
          {renderAnnouncementContent()}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: "#dbdbdb" }}>
            <Pagination count={2} page={currentPage} onChange={handlePageChange} />
          </Box>

          <Box sx={{ background: 'linear-gradient(to right, #000000 , #434343)',pb: 3}}>
            <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 20, sm: 25, md: 30 }, fontWeight: "bold", textAlign: "center", color: "white", py:{ xs: 1, sm: 2, md: 3 }}}>FEATURED PRODUCTS</Typography>
            <Slider {...settings}>
                {renderProductSlides().map((slide) => (
                  <Grid item xs={12} sm={6} md={4} key={slide.key}>
                    {slide}
                  </Grid>
                ))}
            </Slider>
          </Box>

          <Box 
            sx={{ 
              background: 'linear-gradient(to right, #414141 , #000000)', 
              textAlign: 'center', 

            }}
          >
            <Typography 
              sx={{ 
                fontFamily: "Kanit", 
                fontSize: { xs: 20, sm: 25, md: 30 }, 
                fontWeight: "bold", 
                color: "white",
                py:{ xs: 1, sm: 2, md: 3 },
              }}
            >
              CATEGORIES
            </Typography>
          <Grid container spacing={3} justifyContent="center" sx = {{pb: { xs: 5, sm: 3, md: 10}}}>
          {categories.map((category, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <Card 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  height: '100%', 
                  boxShadow: 3, 
                  borderRadius: 2, 
                  mx: 4,
                  transition: 'transform 0.3s, box-shadow 0.3s', 
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: 6,
                  }
                }}
              >
                <CardMedia
                  component="img"
                  image="/public/assets/log.png"
                  alt="Category Image"
                  sx={{
                    height: {xs:100, sm: 150, md:200},
                    objectFit: 'cover',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    position: 'relative',
                    borderRadius: 'inherit', 
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '50%', 
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent)',
                      zIndex: 1,
                    },
                    '&:hover': {
                      boxShadow: 10, 
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    textAlign: 'center',
                    width: '100%',
                    zIndex: 2,
                    
                  }}
                >
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="div" 
                    sx={{ 
                      fontFamily: "Inter", 
                      fontWeight: "bold", 
                      fontSize: { xs: 16, sm: 20, md: 24 },
                      lineHeight: 1.2,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Button 
                    onClick={() => {
                        navigator(`/shop/${category.value}`)                      
                    }}
                    variant="outlined" 
                    color="primary"
                    sx={{
                  
                      color: 'white', 
                      borderColor: 'white',             
                    }}
                  >
                    <Typography
                      sx={{ 
                        fontFamily: "Inter",  
                        fontSize: { xs: 9, sm: 20, md: 20 },
                    
                      }}>
                    View More
                    </Typography>
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          </Grid>
          </Box>
          <Box sx={{ padding: 2, textAlign: 'center' }} style={styles.root}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={4}>
                <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 20, sm: 25, md: 30 }, fontWeight: "bold", textAlign: "center", color: "white" }}>
                  BE NOTIFIED
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={validationSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    console.log('Form submitted:', values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={8}>
                          <Field name="email">
                            {({ field, meta }) => (
                              <div>
                                <TextField
                                  {...field}
                                  id="email"
                                  label="Email"
                                  variant="filled"
                                  fullWidth
                                  type='email'
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
                        <Grid item xs={12} sm={12} md={4}>
                          <FilledButton disabled={isSubmitting} type="submit">SUBSCRIBE</FilledButton>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Grid>
            </Grid>
          </Box>
          <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="xl">
              {selectedProduct && (
                  <ProductDescription product={selectedProduct} onClose={handleCloseModal} />
              )}
          </Dialog>
          <Footer />
        </>
      )}
    </div>
  );
};

export default Home;