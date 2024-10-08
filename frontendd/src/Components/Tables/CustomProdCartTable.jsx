import React, { useEffect, useState } from 'react';
import {
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Input,
  CircularProgress,
  Card,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputBase
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCart } from '../../ContextAPI/CartProvider';

import Navbar from '../../Widgets/Navbar';
import Footer from '../Footer';

const CustomProdCartTable = () => {

    const [cart, setCart] = useState([]);
    const [cookie] = useCookies(['?id', '?role']);
    const [loading, setLoading] = useState(false);
    const [maxQnt, setMaxQnt] = useState({});
  
    const { removeFromCart } = useCart();
    const navigator = useNavigate();
    const { productID, customizedProductImageURL, smallQnt, mediumQnt, largeQnt, extraLargeQnt, doubleXLQnt, tripleXLQnt } = useParams();
  
    useEffect(() => {
      fetchCartItems();
    }, [productID, customizedProductImageURL, smallQnt, mediumQnt, largeQnt, extraLargeQnt, doubleXLQnt, tripleXLQnt]);
  
    const fetchCartItems = async () => {
      try {
        const response = await axiosClient.get(`prd/fetchProductByID/${productID}`);
  
        if (response.data) {
         
          const productData = response.data.map((item) => ({
            ...item,
            productQuantity: 1, 
            productSize: 'S', 
          }));
  
          setCart(productData);
  
          // Prepare maxQnt object with productName as key and maximumQuantity as value
          const maxQuantityObj = {};
          productData.forEach((cartItem) => {
            maxQuantityObj[cartItem.productName] = cartItem.maximumQuantity;
          });
          setMaxQnt(maxQuantityObj);
        }
      } catch (error) {
        console.log(error);
      }
    };
  
    const handleRemoveFromCart = async (productName, productSize) => {
      try {
        const valueToRemove = {
          uid: cookie['?id'],
          productName: productName,
        };
        await axiosClient.post('cart/removeFromCart', valueToRemove);
  
        const newCartItemData = cart.filter(
          (cartItem) =>
            cartItem.productName !== productName || cartItem.productSize !== productSize
        );
        setCart(newCartItemData);
  
        toast.success('Item Removed', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'colored',
          transition: Bounce,
          style: { fontFamily: 'Kanit', fontSize: '16px' },
        });
  
        removeFromCart(productName, productSize);
      } catch (error) {
        console.log(error);
      }
    };

    const handleSizeChange = (productName, newSize) => {
        const updatedCart = cart.map((item) => {
            if (item.productName === productName) {
                return { ...item, productSize: newSize };
            }
            return item;
        });
        setCart(updatedCart);
    };
  
    const handleQuantityChange = (productName, newQuantity) => {
      const quantity = parseInt(newQuantity, 10);
  
      // Get the maximum quantity allowed for the product
      const maxQuantityAllowed = maxQnt[productName];
  
      if (quantity > maxQuantityAllowed) {
        newQuantity = maxQuantityAllowed;
      } else if (!quantity || isNaN(quantity)) {
        newQuantity = 1;
      }
  
      const updatedCart = cart.map((item) => {
        if (item.productName === productName) {
          return { ...item, productQuantity: newQuantity };
        }
        return item;
      });
  
      setCart(updatedCart);
    };
  
    const handleCheckout = async () => {
      try {
        setLoading(true);
        // console.log(cart[0].productSize)
        navigator(`/singleProductCheckout/${productID}/${cart[0].productQuantity}/${cart[0].productSize}`);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
  
    const subtotal =
      cart.length > 0
        ? cart.reduce((acc, item) => acc + item.productPrice * item.productQuantity, 0)
        : 0;
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundImage: 'url(/src/assets/cartGraffiti.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div style={{ maxWidth: '1000px', width: '100%', padding: '20px' }}>
            <Typography
              align="center"
              sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 600, color: 'black', marginBottom: '20px' }}
            >
              CART
            </Typography>
            <Typography
                align="center"
                sx={{
                fontFamily: 'Kanit',
                fontSize: { xs: 14, md: 18 },
                fontWeight: 400,
                color: 'black', 
                marginBottom: '20px', 
                }}
            >
                Finalize your <b>customized product request</b> before proceeding.
            </Typography>
            <Grid container spacing={2}>
              {cart.length > 0 ? (
                cart.map((cartItem) => (
                  <Grid item xs={12} sm={12} md={12} key={cartItem.id}>
                    <Card component={Paper}>
                      <CardContent>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={2} sm={2} md={2}>
                            <img
                              src={cartItem.productImage}
                              alt="Product"
                              style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                width: 'auto',
                                height: 'auto',
                              }}
                            />
                          </Grid>
                          <Grid item xs={8} sm={8}>
                            <Typography
                              sx={{
                                fontFamily: 'Inter',
                                fontSize: { xs: 14, sm: 16, md: 18 },
                                fontWeight: 500,
                                color: 'black',
                              }}
                            >
                              <b>[CUSTOMIZED]</b> {cartItem.productName}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: 'Inter',
                                fontSize: { xs: 12, sm: 14, md: 16 },
                                color: 'black',
                              }}
                            >
                              Price of : <b>₱{cartItem.productPrice}</b>
                            </Typography>
                             <FormControl sx={{ minWidth: 120 }}>
                             <Select
                                value={cartItem.productSize}
                                onChange={(e) => handleSizeChange(cartItem.productName, e.target.value)}
                                IconComponent={ArrowDropDownIcon}
                                input={
                                    <InputBase
                                        sx={{
                                            fontFamily: 'Inter',
                                            fontSize: { xs: 14, sm: 16, md: 18 },
                                            border: 'none',
                                            '&:focus': { border: 'none' },
                                        }}
                                    />
                                }
                                sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: { xs: 14, sm: 16, md: 17 },
                                    borderBottom: '1px solid black',
                                    '&:before': { borderBottom: 'none' },
                                    '&:after': { borderBottom: 'none' },
                                }}
                            >
                                <MenuItem
                                    value="S"
                                    sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: { xs: 12, sm: 14 }, 
                                    }}
                                    disabled={cartItem.smallQuantity === 0}
                                >
                                    Small
                                </MenuItem>
                                <MenuItem
                                    value="M"
                                    sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: { xs: 12, sm: 14 }, 
                                    }}
                                    disabled={cartItem.mediumQuantity === 0}
                                >
                                    Medium
                                </MenuItem>
                                <MenuItem
                                    value="L"
                                    sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: { xs: 12, sm: 14 }, 
                                    }}
                                    disabled={cartItem.largeQuantity === 0}
                                >
                                    Large
                                </MenuItem>
                                <MenuItem
                                    value="XL"
                                    sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: { xs: 12, sm: 14 }, 
                                    }}
                                    disabled={cartItem.extraLargeQuantity === 0}
                                >
                                    Extra Large
                                </MenuItem>
                            </Select>

                            </FormControl>
                            <Typography
                              sx={{
                                fontFamily: 'Inter',
                                fontSize: { xs: 12, sm: 14, md: 16 },
                                color: 'black',
                              }}
                            >
                            </Typography>
                            <Input
                              type="number"
                              value={cartItem.productQuantity}
                              onChange={(e) =>
                                handleQuantityChange(cartItem.productName, e.target.value)
                              }
                              inputProps={{ min: 1 }}
                              sx={{
                                width: { xs: '60px', sm: '80px' },
                                fontSize: { xs: '14px', sm: '16px' },
                                fontFamily: 'Kanit',
                              }}
                            />
                            <Typography
                              sx={{
                                fontFamily: 'Inter',
                                fontSize: { xs: 12, sm: 14, md: 16 },
                                fontWeight: 500,
                                color: 'black',
                              }}
                            >
                              Total: <b>₱{(cartItem.productPrice * cartItem.productQuantity).toFixed(2)}</b>
                            </Typography>
                          </Grid>
                         
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Card component={Paper}>
                    <CardContent>
                      <Typography
                        sx={{
                          fontFamily: 'Inter',
                          fontSize: { xs: 12, sm: 15, md: 16 },
                          fontWeight: 500,
                          color: 'black',
                        }}
                      >
                        Your cart is empty.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
            <Typography
            sx={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 500, color: 'black', textAlign: { xs: 'center', md: 'end' }, marginTop: '20px', marginBottom: '20px' }}
             >
            <b> Subtotal: ₱{subtotal.toFixed(2)}</b>
             </Typography>
          <Grid
            container
            justifyContent={{ xs: 'center', md: 'flex-end' }}
            spacing={2}
            sx={{ marginBottom: '20px' }}
>
            <Grid item>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to="/shop"
                sx={{
                  '&:hover': { borderColor: '#414a4c', backgroundColor: '#414a4c', color: 'white' },
                  '&:not(:hover)': { borderColor: '#3d4242', color: 'black' },
                }}
              >
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5 }}>Continue Shopping</Typography>
              </Button>
            </Grid>
            <Grid item>
              {cart.length > 0 && (
                <Button
                  type="submit"
                  fullWidth
                  disabled={loading}
                  onClick={handleCheckout}
                  variant="contained"
                  sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                    opacity: cart.length > 0 ? 1 : 0.5,
                    position: 'relative',
                    background: 'linear-gradient(to right, #414141  , #000000)',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 18, md: 25 },
                      padding: 0.5,
                      visibility: loading ? 'hidden' : 'visible',
                    }}
                  >
                    Proceed to Checkout
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
              )}
              {cart.length === 0 && (
                <Button
                  disabled
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                    opacity: 0.5,
                  }}
                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, padding: 0.5 }}>Proceed to Checkout</Typography>
                </Button>
              )}
            </Grid>
          </Grid>
        </div>
      </div>
      <Footer />
    </div>
  );
};
export default CustomProdCartTable;