import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid, Divider, CircularProgress} from '@mui/material';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';

const OrderDetails = ({ timeStamp }) => {

  const [orderDetails, setOrderDetails] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  },[]);

  // console.log(`Order Details.jsx ${timeStamp}`);

  const fetchOrderDetails = async () => {

    setOrderDetailsLoading(true)

    try {
      const orderDetailsResponse = await axiosClient.get(`order/fetchCurrentOrderForReceipt/${cookie['?id']}/${timeStamp}`);
      if(orderDetailsResponse.data) {
        const mergedOrders = mergeOrders(orderDetailsResponse.data);
        setOrderDetails(mergedOrders);
      } 
      
      setTimeout(() => {
        setOrderDetailsLoading(false)
      }, [800])

    } catch (error) {
      console.log(error);
    }
    finally {
      setTimeout(() => {
        setOrderDetailsLoading(false);
      }, 1200); 
    }
  };

  const mergeOrders = (orders) => {
    const mergedOrders = [];
    const orderMap = new Map();
  
    orders.forEach((order) => {
      const key = order.orderInfo.associatedOrderID === "None" ? order.orderID : order.orderInfo.associatedOrderID;
  
      if (orderMap.has(key)) {
        const existingOrder = orderMap.get(key);
  
        existingOrder.orderInfo.productName += `, ${order.orderInfo.productName}`;
        if (typeof existingOrder.orderInfo.productQuantity === 'string') {
          existingOrder.orderInfo.productQuantity += `, ${order.orderInfo.productQuantity}`;
        } else {
          existingOrder.orderInfo.productQuantity = `${existingOrder.orderInfo.productQuantity}, ${order.orderInfo.productQuantity}`;
        }
        existingOrder.orderInfo.productSize += `, ${order.orderInfo.productSize}`;
      } else {
        if (typeof order.orderInfo.productQuantity !== 'string') {
          order.orderInfo.productQuantity = `${order.orderInfo.productQuantity}`;
        }
  
        orderMap.set(key, order);
      }
    });
  
    orderMap.forEach((value) => {
      mergedOrders.push(value);
    });
  
    return mergedOrders;
  };

  const subtotal = orderDetails.reduce((acc, order) => acc + (order.orderInfo.amountToPay || 0), 0);
  const shippingCost = 100;
  const total = subtotal + shippingCost;

  return (
    <div>
      {orderDetailsLoading ? (
        <Grid container justifyContent="center" alignItems="center">
          <CircularProgress />
        </Grid>
      ) : orderDetails.length > 0 ? (
        orderDetails.map((order) => (
          <Grid item xs={12} key={order.orderID}>
            <Paper sx={{ padding: '1rem', boxShadow: '2px 5px 10px rgba(0,0,0,0.2)' }}>
              <Grid container>
                <Grid item xs={12} sm={4} md={4}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                    PRODUCT(s)
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    {order.orderInfo.productName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                    QUANTITY
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    x{order.orderInfo.productQuantity}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                    TOTAL
                  </Typography>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    ₱{order.orderInfo.amountToPay}.00
                  </Typography>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} alignItems="center" sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        fontWeight: 'bold', 
                        color: 'black'
                      }}
                    >
                      Subtotal
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: 'right' }}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        color: 'black'
                      }}
                    >
                      ₱{subtotal}.00
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} alignItems="center">
                  <Grid item xs={6}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        fontWeight: 'bold', 
                        color: 'black'
                      }}
                    >
                      Shipping
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: 'right' }}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        color: 'black'
                      }}
                    >
                      ₱{shippingCost}.00
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} sm={12} md={12} alignItems="center">
                  <Grid item xs={6}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        fontWeight: 'bold', 
                        color: 'black'
                      }}
                    >
                      Total
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ textAlign: 'right' }}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Kanit', 
                        fontSize: { xs: 12, md: 16 }, 
                        color: 'black'
                      }}
                    >
                      <b>₱{total}.00</b>
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))
      ) : (
        <Typography sx={{ padding: '1rem', fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
          No orders found.
        </Typography>
      )}
    </div>
  );
};

export default OrderDetails;