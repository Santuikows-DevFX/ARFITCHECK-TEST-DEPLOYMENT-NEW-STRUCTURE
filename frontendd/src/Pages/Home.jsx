import React, { useEffect, useState } from 'react';
import { useStateContext } from '../ContextAPI/ContextAPI';
import axiosClient from '../axios-client';
import { useCookies } from 'react-cookie';
import { Typography, Pagination, Card, CardActionArea, CardContent, Box, Grid, CardMedia, IconButton, InputAdornment, TextField, FormHelperText, Button, Dialog, ImageList, ImageListItem } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Footer from '../Components/Footer';
import PreLoader from '../Components/PreLoader';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Widgets/Navbar.jsx';
import ProductDescription from './Customers/ProductDescription.jsx';
import shopGraffiti from '../../public/assets/shopGraffiti1.png'
import homeSliderImageOne from '../../public/assets/Announcement/Eventsv2.png'
import homeSliderVideo from '../../public/assets/nigg/Ads.mp4'
import categoriesTempPics from '../../public/assets/log.png'
import HandshakeIcon from '@mui/icons-material/Handshake';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import comingSoongIMG from '../../public/assets/comingSoonImage.png'
import bmicHighLightImage from '../../public/assets/bmicHomePageImage.png';
import bmicHighLightImageOne from '../../public/assets/bmicHomePageImageTwo.png';
import bmicHighLightImageTwo from '../../public/assets/bmicHomePage.png';
import bmicComingSoonPrdImageSample from '../../public/assets/productComingSoonSample.png';
import bmicCoverImage from '../../public/assets/bmicHomePageLogoImage.png'

import { off, onValue, ref } from 'firebase/database';
import { db } from '../firebase.js';

const comingSoonPrd = [
  { name: "asasa", image: bmicHighLightImage },
  { name: "asasa", image: bmicHighLightImageOne },
  { name: "asasa", image: bmicHighLightImageTwo },
  { name: "asasa", image: bmicComingSoonPrdImageSample },
  { name: "asasa", image: comingSoongIMG },
];

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
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const dbRef = ref(db, 'orders');
  
    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchProducts();
        fetchMyOrders();
        fetchCustomizationRequest();
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error listening to Realtime Database: ", error);
    });
  
    return () => {
      off(dbRef); 
      listener();
    };
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

  const checkIfCustomRequestPassedThePaymentDate = (approvedDate, requestID, isPaid) => {
    try {

      //yung araw na inupdate ni admin yung request as approved
      const approveDate = new Date(approvedDate)
      const currDate = new Date();

      const timeDiff = currDate.getTime() - approveDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24);

      //check if the day diff is > 2 which means lagpas na siya sa 2 day policy natin
      if (dayDiff >= 2 && !isPaid) {
        handleAutomaticCancelCustomRequests({orderID: requestID, orderType: 'Cancel', cancelReason: 'User didn\'t pay in time'})
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

      console.log(dayDiff);
      

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

  const comingSoonSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    fade: true,   
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false 
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
    return displayProducts.slice(0, 5).map(product => (
      <Card
        key={product.productID}
        sx={{ 
          width: { xs: '85%', sm: '80%', md: '90%' }, 
          height: { xs: '15vmax', sm: '80%', md: '80%' }, 
          cursor: 'pointer', 
          margin: '0 10px',  
          transition: 'transform 0.2s ease', 
          '&:hover': {
            transform: 'scale(1.09)',
          },
          borderRadius: 3.5
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
          <Box 
            sx={{ 
              width: '100%', 
              height: { xs: '60%', sm: '40vh', md: '95vh' }, 
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box 
              component="img"
              src={homeSliderImageOne}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(5px) brightness(60%)',
              }}
            />
    
            <Box
              sx={{
                position: 'absolute',
                top: {xs: '60%', md: '38%'},
                left: '10%',
                transform: 'translateY(-50%)',
                color: '#fff',
                textAlign: 'left',
              }}
            >
              <Typography sx={{fontFamily: 'Storm', fontSize: { xs: 40, md: 120 },textShadow: '4px 4px 4px rgba(0, 0, 0, 0.9)' }}>
                B.MIC CLOTHING
              </Typography>
              
              <Typography sx={{ mb: {xs: 1, md: 2}, mt: {xs: -0.5, md: -5} ,fontFamily: 'Kanit', fontSize: { xs: 10, md: 35 },textShadow: '4px 4px 4px rgba(0, 0, 0, 0.6)' }}>
                Get and Try our App
              </Typography>
              <a href="/tool" style={{ textDecoration: 'none' }}>
                <Button
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
                    padding: { xs: '5px 16px', md: '10px 20px' },
                    borderRadius: '5px',
                    fontFamily: 'Kanit',
                    fontSize: { xs: '8px', md: '16px' }
                  }}
                >
                  Download Here
                </Button>
              </a>

            </Box>
          </Box>
        );
          
      case 2:
        return (
          <Box sx={{ width: '100%', height: { xs: '50%', sm: '40vh', md: '95vh' }, overflow: 'hidden' }}>
            <video autoPlay loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
              <source src={homeSliderVideo} type="video/mp4" />
            </video>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: "#dbdbdb", boxShadow: 5 }}>
            <Pagination count={2} page={currentPage} onChange={handlePageChange} />
          </Box>

          {/* PAMPA IMPRESS LANG */}
          <Box 
            sx={{ 
              backgroundImage: `url(${shopGraffiti})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat', 
              py: { xs: 2, sm: 4, md: 6 }, 
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <Grid 
              container 
              spacing={3} 
              justifyContent="center" 
              sx={{ 
                mx: { xs: -2.5, md: 'auto'},
                maxWidth: '1700px', 
                padding: { xs: 1, sm: 2 },
              }}
            >
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    boxShadow: 5,
                    borderRadius: 4,
                    background: "linear-gradient(to right, #E9E9E9 , #F6F6F6)",
                    height: { xs: 'auto', md: '200px' }, 
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <TipsAndUpdatesIcon sx={{ color: 'black', fontSize: '2rem' }}/>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 'bold' }}>
                    Unique Designs
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, sm: 14, md: 16 }, mt: 1 }}>
                    Each clothes has its own style.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    boxShadow: 5,
                    borderRadius: 4,
                    background: "linear-gradient(to right, #E9E9E9 , #F6F6F6)",
                    height: { xs: 'auto', md: '200px' }, 
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: 'black', fontSize: '2rem' }}/>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 'bold' }}>
                    High Quality
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, sm: 14, md: 16 }, mt: 1 }}>
                    We make sure you receive only the best.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    boxShadow: 5,
                    borderRadius: 4,
                    background: "linear-gradient(to right, #E9E9E9 , #F6F6F6)",
                    height: { xs: 'auto', md: '200px' },
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CheckroomIcon sx={{ color: 'black', fontSize: '2rem' }}/>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 'bold' }}>
                    Wide Selection
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, sm: 14, md: 16 }, mt: 1 }}>
                    Select the best design that suits you.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    textAlign: 'center', 
                    boxShadow: 5,
                    borderRadius: 4,
                    height: { xs: 'auto', md: '200px' },
                    background: "linear-gradient(to right, #E9E9E9 , #F6F6F6)",
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <HandshakeIcon sx={{ color: 'black', fontSize: '2rem' }}/>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, sm: 18, md: 20 }, fontWeight: 'bold' }}>
                    Good Customer Service
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, sm: 14, md: 16 }, mt: 1 }}>
                    Your satisfaction is our priority.
                  </Typography>
                </Card>
              </Grid>
            </Grid>

          </Box>

          {/* SLIDER OF THE PRODUCT */}
          <Box sx={{ background: 'linear-gradient(to right, #000000 , #434343)',pb: 3}}>
            <Typography sx={{ fontFamily: "Kanit", fontSize: { xs: 20, sm: 25, md: 30 }, fontWeight: "bold", textAlign: "center", color: "white", py:{ xs: 1, sm: 2, md: 3 }}}>HAVE A GLIMPSE OF OUR PRODUCTS</Typography>
            <Slider {...settings}>
                {renderProductSlides().map((slide) => (
                  <Grid item xs={12} sm={6} md={4} key={slide.key}>
                    {slide}
                  </Grid>
                ))}
            </Slider>
          </Box>

          {/* COMING SOON */}
          <Box
            sx={{
              backgroundImage: `url(${shopGraffiti})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              minHeight: '100vh', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              textAlign: 'center',
              overflow: 'hidden',
            }}
          >
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              sx={{
                maxWidth: '1700px',
                padding: { xs: 1, sm: 2 },
                minHeight: '100%', // Ensures full height of the parent
              }}
            >
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: { xs: 3 } }}>
                <Box
                  component="img"
                  src={bmicCoverImage}
                  alt="Edited Image"
                  sx={{
                    width: { xs: '90%', md: '80%' },
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} sx={{ mx: { xs: 2.5, md: 'auto' }, width: { xs: '80%', md: '100%' } }}>
                <Slider {...comingSoonSliderSettings}>
                  {comingSoonPrd.map((product, index) => (
                    <div key={index}>
                      <Card
                        sx={{
                          borderRadius: '8px',
                          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
                          height: { xs: '48vh', sm: '10vh', md: 'auto' },
                          maxWidth: { xs: '600px', md: '660px' },
                          ml: { xs: 'auto', md: 12 },
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={product.image}
                          alt={product.name}
                          sx={{
                            borderRadius: '8px',
                            objectFit: 'cover',
                            height: { xs: '48vh', sm: '10vh', md: '70.6vh' },
                            width: '100%',
                          }}
                        />
                      </Card>
                    </div>
                  ))}
                </Slider>
              </Grid>
            </Grid>
          </Box>
          {/* CATEGORIES */}
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
              BROWSE BY CATEGORY
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
                  boxShadow: 5, 
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
                  image={categoriesTempPics}
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
                      fontFamily: "Kanit", 
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
                        fontFamily: "Kanit",  
                        fontSize: { xs: 9, sm: 20, md: 20 },
                    
                      }}>
                    SHOP NOW
                    </Typography>
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
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