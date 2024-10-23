import React, { useEffect } from 'react'
import { Box, Typography, Divider, Grid, Avatar, IconButton, Button } from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import TransactionHistoryTable from '../../Components/Tables/TransactionHistoryTable';
import axiosClient from '../../axios-client';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import { onValue, ref } from 'firebase/database';
import { db } from '../../firebase';


function TransactionHistory() {

  const [isLoading, setIsLoading] = React.useState(true);
  const [completedOrders, setCompletedOrders] = React.useState([]);

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
        fetchOrders();
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error listening to Realtime Database: ", error);
    });
  
    return () => listener();
  }, [])

  const fetchOrders = async () => {
    try {
      const orderResponse = await axiosClient.get('order/fetchTransactionHistory');
      const mergedOrders = mergeOrders(orderResponse.data);
      setCompletedOrders(mergedOrders);
    } catch (error) {
      console.error(error);
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

  const handleSaveAsExcel = () => {
    try {

      const fields = ['Order Date', 'Product', 'Quantity', 'Size', 'Amount', 'Payment Method', 'Shipping Address', 'Status'];

      const csvRows = completedOrders.map(order => {

        const orderDate = order.orderInfo.orderDate;
        const orderedProducts = order.orderInfo.productName.split(', ').join(' | ');
        const orderedQuantity = order.orderInfo.productQuantity.split(', ').join(' | ');
        const orderedSize = order.orderInfo.productSize.split(', ').join(' | ');
        const orderedAmount = order.orderInfo.amountToPay.toFixed(2);
        const paymentMethod = order.orderInfo.paymentMethod === 'cash' ? 'Cash' : 'E-Wallet';
        const fullShippingAddress = `"${order.orderInfo.fullShippingAddress}"`;
        const orderStatus = order.orderInfo.orderStatus;
        
        return [orderDate, orderedProducts, orderedQuantity, orderedSize, orderedAmount, paymentMethod, fullShippingAddress, orderStatus].join(',');
      });

      //what this does is it joins the headers and the rows data together
      const csvContent = [fields.join(','), ...csvRows].join('\n'); 
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); //blob is the file explorer being opened when saving a file

      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);

      //getting the date today
      const dateToday = dayjs().format('YYYY-MM-DD');

      link.setAttribute('href', url);
      link.setAttribute('download', `${dateToday}_transaction_order_history.csv`);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

    }catch(error) {
      console.log(error);
    }
  }


  return (
    <div>
        {isLoading ? (
        <PreLoader />
      ) : (
       <Box m={2} >
      <Grid container direction="column" spacing={2}>
        <Grid item container justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontFamily: 'Kanit', fontSize: 50, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
            Transaction History
          </Typography>
          <Grid container spacing={4} sx={{ width: "45%", justifyContent:'flex-end', alignItems: "center" }}>
        <Grid item xs={6}>
          <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: '#196F3D',
                  color: 'white',
                  '&:not(:hover)': { backgroundColor: '#317000', color: 'white' },
                  '&:hover': { backgroundColor: '#239B56' },
                  fontSize: { xs: 10, md: 16 },  
                  padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                  fontFamily: 'Kanit',
                  fontWeight: 'bold',
                }}
                startIcon={<DownloadIcon />}
                onClick={handleSaveAsExcel}

          >
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 24.5, padding: 0.5 }}>Save as .CSV</Typography>
          </Button>
        </Grid>
      </Grid>
        </Grid>
        <Grid item>
          <Divider sx={{ borderTopWidth: 2, mb : 3 }}/>
        </Grid>
      
      </Grid>
       <TransactionHistoryTable mergedProductOrders={completedOrders}/>
     </Box>
      )}
    </div>
  )
}

export default TransactionHistory