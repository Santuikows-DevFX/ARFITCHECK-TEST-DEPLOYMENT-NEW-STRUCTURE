import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';
import { Link } from 'react-router-dom';
import { Container, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button, Box } from '@mui/material';

const TempoCart = () => {

    const [cart, setCart] = useState([])
    const [cookie] = useCookies(['?id'])
   
    useEffect(() => { 
       fetchCartItems();
    }, [])
   
    const fetchCartItems = async () => { 
       try {
   
           const uid =  {
               uid: cookie['?id']
           }
   
           await axiosClient.post('cart/getMyCartItems', uid)
           .then(({data}) => { 
               if(data){
                setCart(data)
                console.log(data);
               }
           })
   
       }catch(error) { 
           console.log(error);
       }
    }
     const subtotal = cart.length > 0 ? cart.reduce((acc, item) => acc + (item.productPrice * item.productQuantity), 0) : 0
   
     const handleRemoveFromCart = (productName) => {

        //remove product from your shitty cart
        try {

            const valueToRemove = { 
                uid: cookie['?id'],
                productName: productName
            }

            axiosClient.post('cart/removeFromCart', valueToRemove)
            const newCartItemData =   cart.filter((cartItem) => {
                return (
                    cartItem.productName !== productName
                )
            })
            //update the fcking state when the product is being filtered
            setCart(newCartItemData)

        }catch(error) {
            console.log(error);
        }
     };
   
     return (
        <div>
          {Object.keys(cart).length > 0 ? (

            <Container
            maxWidth="md"
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
            }}
            >
            <Box>
              <Container
                maxWidth="md"
                style={{
                  boxShadow: '0px 10px 4px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  backgroundColor: '#F4F6F6'
                }}
              >
                <h1 className='text-center'>CART</h1>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '50px' }}>Product</TableCell>
                        <TableCell></TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cart.length > 0 ? (
                        cart.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell><img src={item.productImage} alt={item.productName} style={{ width: '80px', height: '80px' }} /></TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell>{item.productSize}</TableCell>
                            <TableCell>PHP {item.productPrice}</TableCell>
                            <TableCell>{item.productQuantity}</TableCell>
                            <TableCell>PHP {item.productTotalPrice}</TableCell>
                            <TableCell>
                              <Button variant="outlined" color="error" onClick={() => handleRemoveFromCart(item.productName)}>
                                REMOVE
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                          <TableRow>
                            <TableCell>No Items</TableCell>
                          </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Container>
              <Typography variant="subtitle1" align="right" gutterBottom>
                Subtotal: PHP {subtotal.toFixed(2)}
              </Typography>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary" component={Link} to="/shop">
                  Continue Shopping
                </Button>
                <Button variant="contained" color="secondary" component={Link} to="/checkout" sx={{ ml: 2 }}>
                  Proceed to Checkout
                </Button>
              </Box>
            </Box>
            </Container>

          ) : (
<Container
            maxWidth="md"
            style={{
              backgroundColor: '#ffffff',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100vh',
            }}
            >
            <Box>
              <Container
                maxWidth="md"
                style={{
                  boxShadow: '0px 10px 4px rgba(0, 0, 0, 0.1)',
                  padding: '20px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  backgroundColor: '#F4F6F6'
                }}
              >
                <h1 className='text-center'>CART</h1>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell style={{ width: '50px' }}>Product</TableCell>
                        <TableCell></TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <p className='text-center'>Loading...</p>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Container>
              <Typography variant="subtitle1" align="right" gutterBottom>
                Subtotal: PHP {subtotal.toFixed(2)}
              </Typography>
              <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary" component={Link} to="/shop">
                  Continue Shopping
                </Button>
                <Button variant="contained" color="secondary" component={Link} to="/checkout" sx={{ ml: 2 }}>
                  Proceed to Checkout
                </Button>
              </Box>
            </Box>
            </Container>
          )}
        </div>
    );
}

export default TempoCart