import React, { useEffect, useState } from 'react';
import { Typography, Paper, Grid, CircularProgress } from '@mui/material';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';

const CustsomizationOrderInfo= ({ timeStamp }) => {

  const [orderInfo, setOrderInfo] = useState([])
  const [cookie] = useCookies(['?id']);
  const [orderInfoLoading, setOrderInfoLoading] = useState(false)
  
  console.log(`Custom Prd info ${timeStamp}`);


  useEffect(() => {
    fetchOrderInfo()
    
  }, [])

  const fetchOrderInfo = async () => {

    setOrderInfoLoading(true)

    try {

      console.log(orderInfo.length);

      const orderInfoResponse =  await axiosClient.get(`custom/fetchCustomizationRequestForReceipt/${cookie['?id']}/${timeStamp}`);
      if(orderInfoResponse.data) {
        const mergedOrders = mergeOrders(orderInfoResponse.data);
        setOrderInfo(mergedOrders)
      }
      
    } catch (error) {
      console.log(error);
    }finally {
      setTimeout(() => {
        setOrderInfoLoading(false)
      }, [800])
    }
  }

  const mergeOrders = (orders) => {
    const mergedOrders = [];
    const orderMap = new Map();
  
    orders.forEach((order) => {
      const key = `${order.orderInfo.orderDate}-${order.orderInfo.orderTimeStamp}-${order.orderInfo.orderStatus}-${order.orderInfo.fullShippingAddress}`;
      if (orderMap.has(key)) {
        const existingOrder = orderMap.get(key);
        existingOrder.orderInfo.productName += `, ${order.orderInfo.productName}`;
        if (typeof existingOrder.orderInfo.productQuantity === 'string') {
          existingOrder.orderInfo.productQuantity += `, ${order.orderInfo.productQuantity}`;
        } else {
          existingOrder.orderInfo.productQuantity = order.orderInfo.productQuantity;
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

  return (
    <div>
      {orderInfoLoading ? (
         <Grid container justifyContent="center" alignItems="center">
           <CircularProgress />
         </Grid>
      ) : (
        orderInfo.length > 0 ? (
          orderInfo.map((order) => (
            <Grid item xs={12} key={order.orderID}>
              <Paper sx={{ padding: '1rem', boxShadow: '2px 5px 10px rgba(0,0,0,0.2)' }}>
                <Grid container >
                  <Grid item xs={12} sm={6} md={3.2}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                      REQUEST ID
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 14 }, color: 'black' }}>
                      {order.orderID}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.5}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                     DATE REQUESTED
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    {order.orderInfo.orderDate}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={1.7}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                      AMOUNT
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    ₱{order.orderInfo.amountToPay}.00
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={1.8}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                     METHOD
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    {order.orderInfo.paymentMethod === 'ewallet' ? 'E-Wallet' : 'Cash'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={2.8}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, fontWeight: 'bold', color: 'black' }}>
                    SHIPPING ADDRESS
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, color: 'black' }}>
                    {order.orderInfo.fullShippingAddress}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))
        ) : (
          <Typography sx={{ padding: '1rem', fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
            No requests found.
          </Typography>
        )
      )}
  </div>
  );
};

export default CustsomizationOrderInfo;