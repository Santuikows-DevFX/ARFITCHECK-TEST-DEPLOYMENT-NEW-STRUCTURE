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
  CardContent
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useCart } from '../../ContextAPI/CartProvider';
import Swal from 'sweetalert2';

import Navbar from '../../Widgets/Navbar';
import Footer from '../Footer';
import cartGraffitiBG from '../../../public/assets/cartGraffiti.png'

const CartTable = () => {
  const [cart, setCart] = useState([]);
  const [cookie] = useCookies(['?id', '?role']);
  const [loading, setLoading] = useState(false);
  const [maxQnt, setMaxQnt] = useState({});

  const { removeFromCart } = useCart();
  const navigator = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const uid = { uid: cookie['?id'] };
      const response = await axiosClient.post('cart/getMyCartItems', uid);

      if (response.data) {
        setCart(response.data);

        // Prepare maxQnt object with productName as key and maximumQuantity as value
        const maxQuantityObj = {};
        response.data.forEach(cartItem => {
          maxQuantityObj[cartItem.productName] = cartItem.maximumQuantity;
        });
        setMaxQnt(maxQuantityObj);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveFromCart = (productName, productSize) => {
    try {

      Swal.fire({
        
        title: "Remove this item from cart?",
        text: "",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Yes",
        customClass: {
          container: 'sweet-alert-container',
        },
      }).then(async (result) => {

        if (result.isConfirmed) {

          const valueToRemove = {
            uid: cookie['?id'],
            productName: productName,
          };

          await axiosClient.post('cart/removeFromCart', valueToRemove);
    
          const newCartItemData = cart.filter(
            cartItem =>
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

        }
      });

      
    } catch (error) {
      console.log(error);
    }
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

    const updatedCart = cart.map(item => {
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
      await Promise.all(
        cart.map(async cartItem => {
          const newCartData = {
            productName: cartItem.productName,
            newQuantity: cartItem.productQuantity,
            uid: cookie['?id'],
          };
          await axiosClient.post('cart/updateCart', newCartData);
        })
      );
      navigator('/checkout');
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
          backgroundImage: `url(${cartGraffitiBG})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div style={{ maxWidth: '1000px', width: '100%', padding: '20px' }}>
          <Typography
            align="center"
            sx={{ fontFamily: 'Kanit',fontSize: { xs: 30, md: 50 }, fontWeight: 600, color: 'black', marginBottom: '20px' }}
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
                Finalize your <b>order(s)</b> before proceeding to checkout.
            </Typography>
          <Grid container spacing={2}>
      {cart.length > 0 ? (
        cart.map(cartItem => (
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
                      height: 'auto'
                    }}
                  />
                </Grid>
                <Grid item xs={8} sm={8}>
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 14, sm: 16, md: 20 },
                      fontWeight: 500,
                      color: 'black'
                    }}
                  >
                    {cartItem.productName}
                  </Typography>
                  {cartItem?.productCategory === 'Caps' ? (
                    <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 12, sm: 14, md: 16 },
                      color: 'black'
                    }}
                   >
                  </Typography>
                  ) : (
                    <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 12, sm: 14, md: 16 },
                      color: 'black'
                    }}
                  >
                    Size: {cartItem.productSize}
                  </Typography>
                  )}
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 12, sm: 14, md: 16 },
                      color: 'black'
                    }}
                  >
                    Price: <b>₱{cartItem.productPrice}</b>
                  </Typography>
                  <Input
                    type="number"
                    value={cartItem.productQuantity}
                    onChange={e => handleQuantityChange(cartItem.productName, e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{
                      width: { xs: '60px', sm: '80px' },
                      fontSize: { xs: '14px', sm: '16px' },
                      fontFamily: 'Kanit'
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: { xs: 12, sm: 14, md: 16 },
                      fontWeight: 500,
                      color: 'black'
                    }}
                  >
                    Total: <b>₱{(cartItem.productPrice * cartItem.productQuantity).toFixed(2)}</b>
                  </Typography>
                </Grid>
                <Grid item xs={2} sm={2} container justifyContent="flex-end">
                  <IconButton
                    onClick={() => handleRemoveFromCart(cartItem.productName, cartItem.productSize)}
                    sx={{ cursor: 'pointer', color: 'red' }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
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
                  color: 'black'
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
                  '&:hover': { borderColor: '#414a4c', background: 'linear-gradient(to right, #414141  , #000000)', color: 'white' },
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
                    opacity: cart.length === 0 || loading ? 0.7 : 1,
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
export default CartTable;