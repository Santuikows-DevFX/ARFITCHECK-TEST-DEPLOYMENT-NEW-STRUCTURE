import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, styled, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import axiosClient from '../../axios-client';

const TempoShop = () => {

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
  
    useEffect(() => {
      fetchProducts();
    }, []);
  
    const fetchProducts = async () => {
      try {
        const productResponse = await axiosClient.get('prd/getProducts');
        setProducts(productResponse.data);
      } catch (error) {
        console.log(error);
      }
    };
  
    const StyledContainer = styled(Container)({
      marginTop: '20px',
      textAlign: 'center',
      backgroundColor: '#ffffff',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      borderRadius: '10px',
      padding: '20px',
      height: '100vh',
      position: 'relative',
    });
  
    const CartButton = styled(Button)({
      position: 'absolute',
      top: '20px',
      right: '20px',
    });
  
    return (
        <div>
          <StyledContainer>
            <CartButton variant="contained" color="primary" component={Link} to="/cart">
              <ShoppingCartIcon />
            </CartButton>
            <Grid container spacing={3} style={{ height: '100%', overflowY: 'auto' }}>
              {products.map((product) => (
                <Grid item xs={6} sm={3}>
                  <Link to={`/product/${product.productName}`} style={{ textDecoration: 'none' }}>
                    <Card style={{ height: '50%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent style={{ flex: '1 0 auto' }}>
                        <img src={product.productImage} alt={product.productName} style={{ width: '100%' }} />
                        <Typography gutterBottom variant="h6" component="div">
                          {product.productName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Price: PHP{product.productPrice}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Link>
                </Grid>
              ))}
            </Grid>
          </StyledContainer>
        </div>
    );
}

export default TempoShop