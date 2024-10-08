import React, { useEffect, useState } from 'react';
import { Button, Typography, Card, CardContent, TextField, Container, Grid, Box } from '@mui/material';
import { Link, NavLink, useParams } from 'react-router-dom';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';


const TempoProductDescription = () => {

    const [quantity, setQuantity] = useState(1);
    const { productName } = useParams();
  
    const [product, setProduct] = useState([]);
    const [cookie, removeCookie] = useCookies(['?id'])
  
    useEffect(() => {
      fetchProductData();
    }, [productName]);
  
    const handleQuantityChange = (event) => {
      const value = parseInt(event.target.value);
      setQuantity(isNaN(value) ? '' : value);
    };
  
    const handleAddToCart = () => {
  
      const cartValue = { 
  
        productImage: product.productImage,
        productName: product.productName,
        //placeholder for size since wala pa yung design ni front end daw
        productSize: "M",
        productPrice: product.productPrice,
        productQuantity: quantity,
        uid: cookie['?id']
  
      }
  
      try {
  
        axiosClient.post('cart/insertCartItems', cartValue)
        .then(({data}) => {
          console.log(data.message);
        })
  
      }catch(error){
        console.log(error);
      }
    };
  
    const fetchProductData = async () => {
      try {
        const productInfo = await axiosClient.get(`prd/getProducts/${productName}`);
        setProduct(productInfo.data);
      } catch (error) {
        console.log(error);
      }
    };
    return (
        <Container>
          <Box mt={4} textAlign="center">
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <img src={product.productImage} alt={product.productName} style={{ maxWidth: '100%', height: 'auto' }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" gutterBottom>
                      <b>
                        {product.productName}
                      </b>
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      Price: PHP{product.productPrice}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {product.productDescription}
                    </Typography>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: 1,
                        max: 10,
                        step: 1,
                      }}
                    />
                    <Grid container justifyContent="space-between">
                    <Button variant="outlined" component={Link} to="/shop">
                        Back
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleAddToCart}>
                        Add to Cart
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Container>
    );
}

export default TempoProductDescription