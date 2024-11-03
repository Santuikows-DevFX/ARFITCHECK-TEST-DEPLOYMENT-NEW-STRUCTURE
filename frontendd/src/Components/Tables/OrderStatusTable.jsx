import React, { useState, useEffect } from 'react';
import {
  Typography, Paper, Box, Button, CircularProgress, Grid, Pagination, FormControl, Select, MenuItem, TextField,
  Tooltip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import axiosClient from '../../axios-client';
import Swal from 'sweetalert2';
import CancelOrder from '../Dialogs/CancelOrder';
import dayjs from 'dayjs';
import TrackingNumber from '../Dialogs/TrackingNumber';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../../firebase';

const OrderStatusTable = () => {

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trackingNumberDialogOpen, setTrackingNumberDialogOpen] = useState(false)
  const [enableNotifyUser, setEnableNotifyUser] = useState(false)

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); 

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectStatus, setSelectStatus] = useState('All');
  const [sortAmount, setSortAmount] = useState('');
  const [sortStatus, setSortStatus] = useState('');
  const [orderIDSearchQuery, setOrderIDSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('')

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
  
    return () => {
      off(dbRef); 
      listener();
    };
  }, []);

  const checkIfOrderDelivered = (orderDateDelivery, orderID) => {
    try {

      const deliveryDate = new Date(orderDateDelivery);
      const getCurrentDate = new Date();

      const timeDiff = getCurrentDate.getTime() - deliveryDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24) // => 1 day = 1000 * 60 * 60 * 24

      //check natin if yung diff from curr date and updated date when delivered is est 1 - 2 days
      if(dayDiff >= 1 && dayDiff <= 2) {
        setEnableNotifyUser(true) 
      }

    }catch(error){
      console.log(error);
      
    }
  }

  const fetchOrders = async () => {
    try {
      const orderResponse = await axiosClient.get('order/fetchOrders');
      const mergedOrders = mergeOrders(orderResponse.data);
      setOrders(mergedOrders);

      orderResponse.data.map((dateDelivery) => {
        if(dateDelivery.orderInfo.orderStatus === 'Parcel out for delivery' && dateDelivery.orderID === dateDelivery.orderInfo.associatedOrderID) {
          checkIfOrderDelivered(dateDelivery.orderInfo.orderDateDelivery, dateDelivery.orderInfo.associatedOrderID)
        }
      })

    } catch (error) {
      console.error(error);
    }
  };

  const statusColorPicker = (status) => {
    if (status === 'Waiting for Confirmation' || status === 'Waiting for Approval') {
      return 'black';
    } else if (status === 'Order Confirmed' || status === 'Request Approved') {
      return '#27ae60';
    } else if (status === 'Preparing Order to Ship' || status === 'Preparing Request to Ship') {
      return '#b7950b';
    } else if (status === 'Parcel out for delivery') {
      return '#2471a3';
    } else {
      return 'black';
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortAmount) {
      return sortAmount === 'asc'
        ? a.orderInfo.amountToPay - b.orderInfo.amountToPay
        : b.orderInfo.amountToPay - a.orderInfo.amountToPay;
    }
    if (sortStatus) {
      const statuses = ['Waiting for Confirmation', 'Order Confirmed', 'Preparing Order to Ship', 'Parcel out for delivery'];
      return sortStatus === 'asc'
        ? statuses.indexOf(a.orderInfo.orderStatus) - statuses.indexOf(b.orderInfo.orderStatus)
        : statuses.indexOf(b.orderInfo.orderStatus) - statuses.indexOf(a.orderInfo.orderStatus);
    }
   
    const dateA = new Date(a.orderInfo.orderDate);
    const dateB = new Date(b.orderInfo.orderDate);

    return dateB - dateA;
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const orderIDMatches = order.orderID.toLowerCase().includes(orderIDSearchQuery.toLowerCase());
  
    if (!orderIDMatches) {
      return false;
    }
  
    if (selectedCategory === 'All' && selectStatus === 'All') {
      return true;
    } else if (selectedCategory !== 'All' && selectStatus === 'All') {
      return selectedCategory === 'Cash'
        ? order.orderInfo.paymentMethod === 'cash'
        : order.orderInfo.paymentMethod === 'ewallet';
    } else if (selectedCategory === 'All' && selectStatus !== 'All') {
      return order.orderInfo.orderStatus === selectStatus;
    } else {
      return (
        (selectedCategory === 'Cash'
          ? order.orderInfo.paymentMethod === 'cash'
          : order.orderInfo.paymentMethod === 'ewallet') &&
        order.orderInfo.orderStatus === selectStatus
      );
    }
  });

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

  const handleOpenTrackingNumberDialog = (orderID) => {
    setSelectedOrder(orderID)
    setTrackingNumberDialogOpen(true)
  }

  const handleCloseTrackingNumberDialog = () => {
    setTrackingNumberDialogOpen(false)
  }
  
  const handleUpdateOrderStatus = (orderID, orderType, paymentMethod) => {
    try {
      const orderData = {
        orderID: orderID,
        orderType: orderType,
        associatedOrderID: orderID,
        isCancellationRequest: false
      };

      if (paymentMethod === 'ewallet' && orderType === 'Confirm') {
        Swal.fire({
          title: "Did you check the receipt?",
          text: "Before proceeding, check the receipt first if its valid.",
          icon: "warning",
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#414a4c',
          confirmButtonText: "Yes",
        }).then((result) => {
          if (result.isConfirmed) {
            updateOrder(orderData);
          }
        });
      } else {
        updateOrder(orderData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateOrder = async (orderData) => {
    setLoading(true);

    try {
      await axiosClient.post('order/updateOrder', orderData)
        .then(({ data }) => {
          if (data.message) {
            setLoading(false);
            fetchOrders();
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDialogOpen = (orderID) => {
    setSelectedOrder(orderID)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
  }

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const handleChangeDate = async (dateValue) => {
    try {
      const formattedDate = dayjs(dateValue).format('YYYY-MM-DD');
    
      let filteredOrders = [];
  
      const sortedDataByDate = await axiosClient.get(`/order/fetchOrdersByDate/${formattedDate}`);
      filteredOrders = sortedDataByDate.data;
  
      if (filteredOrders) {
        if (sortedDataByDate.data.message) {
          setOrders([]);
        } else {
          const mergedOrders = mergeOrders(filteredOrders);
          setOrders(mergedOrders);
        }
      }
    } catch (error) {
      console.log("Failed to fetch orders by date:", error);
    }
  };

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div>
      <Box sx={{ padding: '1rem', backgroundColor: '#FFFFFF', boxShadow: '2px 5px 10px rgba(0,0,0,0.4)' }}>
        <Box sx={{ flexGrow: 1, padding: '1rem' }}>
          <Grid container spacing={2} alignItems="center">
            {/* date man */}
            <Grid item xs={6} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  onChange={(dateValue) => handleChangeDate(dateValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                    />
                  )}
                  fullWidth
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:before, &:after': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:focus .MuiOutlinedInput-notchedOutline': { 
                      
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black',
                      borderColor: 'black'
                    },
                    '& .MuiSelect-root': { 
                      borderBottom: '3px solid black',
                      borderRadius: '0', 
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            {/* amount */}
            <Grid item xs={6} sm={6} md={3}>
              <FormControl fullWidth>
                <Select
                  value={sortAmount}
                  onChange={(e) => setSortAmount(e.target.value)}
                  displayEmpty
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:before, &:after': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:focus .MuiOutlinedInput-notchedOutline': { 
                      
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black',
                      borderColor: 'black'
                    },
                    '& .MuiSelect-root': { 
                      borderBottom: '3px solid black',
                      borderRadius: '0', 
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Sort by Amount</Typography>
                  </MenuItem>
                  <MenuItem value="asc">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Lowest To Highest</Typography>
                  </MenuItem>
                  <MenuItem value="desc">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Highest To Lowest</Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* status */}
            <Grid item xs={6} sm={6} md={3}>
              <FormControl fullWidth>
                <Select
                  value={selectStatus}
                  onChange={(e) => setSelectStatus(e.target.value)}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Filter by status' }}
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: 22,
                    '& .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:before, &:after': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': { 
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black'
                    },
                    '&:focus .MuiOutlinedInput-notchedOutline': { 
                      
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'None',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black',
                      borderColor: 'black'
                    },
                    '& .MuiSelect-root': { 
                      borderBottom: '3px solid black',
                      borderRadius: '0', 
                    },
                  }}
                >
                  <MenuItem value="All">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>All Status</Typography>
                  </MenuItem>
                  <MenuItem value="Waiting for Confirmation">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Waiting for Confirmation</Typography>
                  </MenuItem>
                  <MenuItem value="Order Confirmed">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Order Confirmed</Typography>
                  </MenuItem>
                  <MenuItem value="Preparing Order to Ship">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Preparing Order to Ship</Typography>
                  </MenuItem>
                  <MenuItem value="Parcel out for delivery">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Parcel out for delivery</Typography>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* payment method */}
            <Grid item xs={6} sm={6} md={3}>
              <FormControl fullWidth>
              <TextField
                onChange={(e) => setOrderIDSearchQuery(e.target.value)}
                placeholder="Enter Order ID"
                inputProps={{ 'aria-label': 'Filter by Order ID' }}
                InputProps={{
                  style: {
                    fontFamily: 'Kanit',
                  },
                }}
                InputLabelProps={{
                  style: {
                    fontFamily: 'Kanit',
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderTop: 'none',
                      borderLeft: 'none',
                      borderRight: 'none',
                      borderBottomColor: 'black',
                      borderRadius: 0,
                      borderBottom: '1.5px solid black',
                    },
                    '&:hover fieldset': {
                      borderBottomColor: 'black',
                      borderBottom: '1.5px solid black',
                    },
                    '&.Mui-focused fieldset': {
                      borderBottomColor: 'black',
                      borderBottom: '1.5px solid black',
                    },
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontFamily: 'Kanit',
                    color: 'black'
                  },
                }}
              />

              </FormControl>
            </Grid>
          </Grid>
        </Box>
      <Box sx={{ margin: '2rem 0' }}>
        <Grid container spacing={2}>
          {currentOrders.length === 0 ? (
              <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, color: 'black' }}>
                  No orders found.
                </Typography>
              </Grid>
            ) : (
             currentOrders.map((order) => (
                <Grid item xs={12} key={order.orderID}>
                  <Paper sx={{ padding: '1rem', boxShadow: '2px 5px 10px rgba(0,0,0,0.2)' }}>
                    <Grid container spacing={2}>
                        {/* order date */}
                        <Grid item xs={12} sm={6} md={1.2}>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                            ORDER DATE
                          </Typography>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
                            {dayjs(order.orderInfo?.orderDate).format('DD/MM/YYYY')}
                          </Typography>
                        </Grid>
                        {/* product name */}
                        <Grid item xs={12} sm={6} md={2}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                          PRODUCT(s)
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                              <b>ID: {order.orderID}</b>
                            </Typography>
                            {order.orderInfo?.productName.split(', ').map((product, index) => (
                              <div key={index}>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                                  {product}
                                </Typography>
                                
                                {order.orderInfo?.orderType === 'default' ? (
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                                  <b>Qnt:</b> {order.orderInfo?.productQuantity.split(', ')[index]} <b>Size:</b> {order.orderInfo?.productSize.split(', ')[index] || '-'}
                                </Typography>
                                ) : (
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                                    <b>Qnt:</b> {order.orderInfo?.productQuantity.split(', ')[index]} <b>Size(s): </b>

                                    {order.orderInfo?.smallQuantity !== "0" ? `S x${order.orderInfo?.smallQuantity}${order.orderInfo?.mediumQuantity !== "0" || order.orderInfo?.largeQuantity !== "0" || order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}

                                    {order.orderInfo?.mediumQuantity !== "0" ? `M x${order.orderInfo?.mediumQuantity}${order.orderInfo?.largeQuantity !== "0" || order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}

                                    {order.orderInfo?.largeQuantity !== "0" ? `L x${order.orderInfo?.largeQuantity}${order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.extraLargeQuantity !== "0" ? `XL x${order.orderInfo?.extraLargeQuantity}${order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}

                                    {order.orderInfo?.doubleXLQuantity !== "0" ? `2XL x${order.orderInfo?.doubleXLQuantity}${order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.tripleXLQuantity !== "0" ? `3XL x${order.orderInfo?.tripleXLQuantity}` : ''}
                                  </Typography>
                                
                                )}

                                {index !== order.orderInfo?.productName.split(', ').length - 1 && <br />}
                              </div>
                            ))}
                          </Typography>
                        </Grid>
                        {/* order type */}
                        <Grid item xs={12} sm={3} md={1}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                            TYPE
                          </Typography>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
                            {order.orderInfo?.orderType.toUpperCase()}
                          </Typography>
                        </Grid>
                        {/* amount to pay */}
                        <Grid item xs={12} sm={6} md={1}>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                            AMOUNT
                          </Typography>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
                            ₱{order.orderInfo?.amountToPay.toFixed(2)}
                          </Typography>
                        </Grid>
                        {/* payment method */}
                        <Grid item xs={12} sm={6} md={1.7}>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                            PAYMENT METHOD
                          </Typography>
                          {order.orderInfo?.paymentMethod === 'cash' ? (
                                  <Typography
                                  sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}
                                  >
                                  <b>Cash</b>
                                </Typography>
                          ) : (
                                order.orderInfo?.orderType === 'custom' && order.orderInfo?.isPaid === false ? (
                                  <Typography
                                    sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}
                                  >
                                    <b>E-Wallet</b>
                                  </Typography>
                                ) : (
                                  <Tooltip
                                    title={
                                      <Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>
                                        User's Mobile #: {order.orderInfo?.mobileNumber}
                                      </Typography>
                                    }
                                    arrow
                                  >
                                    <Typography
                                      sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: '#1F618D', cursor: 'pointer', textDecoration: 'underline' }}
                                      onClick={() => openImageInNewTab(order.orderInfo?.receiptImage)}
                                    >
                                      <b>E-Wallet</b>
                                    </Typography>
                                  </Tooltip>
                                )
                          )}
                        </Grid>
                        {/* shipping address */}
                        <Grid item xs={12} sm={6} md={1.6}>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                            SHIPPING ADDRESS
                          </Typography>
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: 'black' }}>
                            {order.orderInfo?.fullShippingAddress}
                          </Typography>
                        </Grid>
                        {/* status */}
                      <Grid item xs={12} sm={6} md={1.9}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                          Status
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: statusColorPicker(order.orderInfo?.orderStatus) }}>
                          <b> {order.orderInfo?.orderStatus}</b>
                        </Typography>
                            {order.orderInfo?.orderStatus === "Parcel out for delivery" ? (
                                <>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Tracking #: {order.orderInfo?.trackingNumber}
                                </Typography>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                  Updated: <b>{order.orderInfo?.updateTimeStamp}</b>
                                </Typography>
                              </>
                              
                            ) : (
                              <>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                  Updated: <b>{order.orderInfo?.updateTimeStamp || '-'}</b>
                                </Typography>
                              </>
                            )}
                      </Grid>
                      {/* buttons */}
                      <Grid item xs={12} sm={6} md={1.5}>
                      {order.orderInfo?.orderStatus === 'Waiting for Confirmation' ? (
                          <Grid container spacing={2}>
                            <Grid item xs={12}>
                              <Button
                                fullWidth
                                disabled={loading}
                                onClick={() => handleUpdateOrderStatus(order.orderID, 'Confirm', order.orderInfo?.paymentMethod)}
                                variant="contained"
                                sx={{
                                  backgroundColor: 'White',
                                  '&:hover': { backgroundColor: '#196F3D', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#239B56', color: 'white' },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: 14,
                                    padding: 0.5,
                                    visibility: loading ? 'hidden' : 'visible',
                                  }}
                                >
                                  CONFIRM
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
                            </Grid>
                            <Grid item xs={12}>
                              <Button
                                fullWidth
                                disabled={loading}
                                onClick={() => handleDialogOpen(order.orderID)}
                                variant="contained"
                                sx={{
                                  backgroundColor: 'White',
                                  '&:hover': { backgroundColor: '#943126', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#860000', color: 'white' },
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontFamily: 'Kanit',
                                    fontSize: 14,
                                    padding: 0.5,
                                    visibility: loading ? 'hidden' : 'visible',
                                  }}
                                >
                                  CANCEL
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
                            </Grid>
                          </Grid>
                        ) : (
                          order.orderInfo?.orderStatus === 'Order Confirmed' ? (
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Button
                                  fullWidth
                                  disabled={loading}
                                  onClick={() => handleUpdateOrderStatus(order.orderID, 'Prepare')}
                                  variant="contained"
                                  sx={{
                                    backgroundColor: 'White',
                                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                                    '&:not(:hover)': { backgroundColor: '#737500', color: 'white' },
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      fontFamily: 'Kanit',
                                      fontSize: 14,
                                      padding: 0.5,
                                      visibility: loading ? 'hidden' : 'visible',
                                    }}
                                  >
                                    PREPARE
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
                              </Grid>
                            </Grid>
                          ) : (
                            order.orderInfo?.orderStatus === 'Preparing Order to Ship' ? (
                              <Grid container spacing={2}>
                                <Grid item xs={12}>
                                  <Button
                                    fullWidth
                                    disabled={loading}
                                    onClick={() => handleOpenTrackingNumberDialog(order.orderID)}
                                    variant="contained"
                                    sx={{
                                      backgroundColor: 'White',
                                      '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                                      '&:not(:hover)': { backgroundColor: '#024685', color: 'white' },
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontFamily: 'Kanit',
                                        fontSize: 14,
                                        padding: 0.5,
                                        visibility: loading ? 'hidden' : 'visible',
                                      }}
                                    >
                                      DELIVER
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
                                </Grid>
                              </Grid>
                            ) : (
                              <Grid container spacing={2}>
                              </Grid>
                            )
                          )
                      )}
                      </Grid>
                    </Grid>
                  </Paper>
                  <CancelOrder open={isDialogOpen} onClose={handleDialogClose} orderID={selectedOrder} orderType={'Cancel'} zIndex={1000} fetchOrders={fetchOrders} />
                  <TrackingNumber open={trackingNumberDialogOpen} onClose={handleCloseTrackingNumberDialog} orderID={selectedOrder} orderType={'Deliver'} fetchOrders={fetchOrders} type={'default'}  />
                </Grid>
            )))}
        </Grid>
      </Box>
        <Pagination
          count={Math.ceil(filteredOrders.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
          sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}
        />
      </Box>
    </div>
  );
};

export default OrderStatusTable;
