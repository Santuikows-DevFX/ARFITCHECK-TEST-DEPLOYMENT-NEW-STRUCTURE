import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Grid,
  Paper,
  Button,
  Pagination,
  FormControl,
  TextField
} from '@mui/material';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import UserCancelOrder from '../Dialogs/UserCancelOrder';
import ViewCustomProductDetails from './ViewCustomProductDetails';
import ProcessPayment from './ProcessPayment';
import { ToastContainer } from 'react-toastify';
import UserCancelCustomRequests from './UserCancelCustomRequests';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../../firebase';

const MyCustomizationRequestsTable = () => {

  const [orders, setOrders] = useState([]);
  const [cookie] = useCookies(['?id']);

  const [cancelDialog, setCancelDialog] = useState(false);
  const [viewCustomizedProductDialog, setViewCustomizedProductDialog] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectStatus, setSelectStatus] = useState('All');

  const [sortAmount, setSortAmount] = useState('');
  const [sortStatus, setSortStatus] = useState('');
  const [orderIDSearchQuery, setOrderIDSearchQuery] = useState('');

  useEffect(() => {
    const dbRef = ref(db, 'customizedRequest');
  
    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchMyOrders();
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

  const fetchMyOrders = async () => {
    try {
      const myCustomizationResponse = await axiosClient.get(`custom/fetchMyCustomizationRequests/${cookie['?id']}`);
      const mergedOrders = mergeOrders(myCustomizationResponse.data);
      setOrders(mergedOrders);

    } catch (error) {
    //   console.log(error);
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

  const handlePaymentDialogOpen = (orderID, selectedEWallet, amountToPay) => {

    const reqData = {
      orderID: orderID,
      ewallet: selectedEWallet,
      amountToPay: amountToPay
    }

    setSelectedOrder(reqData)
    setPaymentDialogOpen(true)
  }

  const handleCancelDialogOpen = (orderInfo, orderID) => {
    const orderData = {
      orderInfo: orderInfo,
      orderID: orderID
    }

    setSelectedOrder(orderData);
    setCancelDialog(true);  
  };  

  const handleViewCustomPrdOpen = (orderInfo) => {

    setSelectedOrder(orderInfo)
    setViewCustomizedProductDialog(true)
  }
  const handlePaymentDialogClose = () => setPaymentDialogOpen(false)
  const handleViewCustomPrdClose = () => setViewCustomizedProductDialog(false);
  const handleCancelDialogClose = () => setCancelDialog(false);

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const handleChangeDate = async (dateValue) => {
    try {
      const formattedDate = dayjs(dateValue).format('YYYY-MM-DD');
      const { data } = await axiosClient.get(`/order/fetchMyOrderByDate/${cookie['?id']}/${formattedDate}`);
      if (data) {
        setOrders(data.message ? [] : mergeOrders(data));
      }
    } catch (error) {
      console.log(error);
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
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };
  return (
    <>
      <Box >
        <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 25, md: 50 }, fontWeight: 'bold', color: 'black', textAlign:"center"}}>
          MY CUSTOMIZATION REQUESTS
        </Typography>
      </Box>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Sort by Amount</Typography>
                  </MenuItem>
                  <MenuItem value="asc">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Lowest To Highest</Typography>
                  </MenuItem>
                  <MenuItem value="desc">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Highest To Lowest</Typography>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>All Status</Typography>
                  </MenuItem>
                  <MenuItem value="Waiting for Confirmation">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Waiting for Confirmation</Typography>
                  </MenuItem>
                  <MenuItem value="Order Confirmed">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Order Confirmed</Typography>
                  </MenuItem>
                  <MenuItem value="Preparing Order to Ship">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Preparing Order to Ship</Typography>
                  </MenuItem>
                  <MenuItem value="Parcel out for delivery">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Parcel out for delivery</Typography>
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
        <Grid container spacing={3}>
          {orders.length === 0 ? (
            <Grid item xs={12} md={12} lg={12} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 25 }, color: 'black' }}>
                No customization request found.
            </Typography>
            </Grid>
          ) : (
            currentOrders.map((order) => (
              <Grid item xs={12} key={order?.orderID}>
              <Paper sx={{ padding: '1rem', boxShadow: '2px 5px 10px rgba(0,0,0,0.2)' }}>
                <Grid container spacing={2}>
                  {/* order date */}
                  <Grid item xs={12} sm={6} md={1.2}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                      REQUEST DATE
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
                                 <b>Qnt:</b> {order.orderInfo?.productQuantity.split(', ')[index]} <b>Size:</b> {order.orderInfo?.productSize.split(', ')[index]}
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
                           order.orderInfo?.receiptImage === 'None' ? (
                            <Typography
                                sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}
                                // onClick={() => openImageInNewTab(order.orderInfo?.receiptImage)}
                            >
                            <b>E-Wallet</b>
                          </Typography>
                           ) : (
                            <Typography
                                sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: '#1F618D', cursor: 'pointer' }}
                                onClick={() => openImageInNewTab(order.orderInfo?.receiptImage)}
                            >
                                <b>E-Wallet</b>
                            </Typography>
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
                  <Grid item xs={12} sm={6} md={2}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color:'black' }}>
                      STATUS
                    </Typography>
                    {order.orderInfo?.isPaid === true ? (
                      <>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: statusColorPicker(order.orderInfo?.orderStatus) }}>
                        <b> {order.orderInfo?.orderStatus}</b>
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                          Payment Status:  <b>Paid </b>
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                          Updated:  <b> {order.orderInfo?.updateTimeStamp}</b>
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: statusColorPicker(order.orderInfo?.orderStatus) }}>
                          <b> {order.orderInfo?.orderStatus}</b>
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                          Payment Status:  <b>{order.orderInfo?.orderStatus === 'Request Approved' ? 'Pending' : '-'}</b>
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                          Updated:  <b> {order.orderInfo?.updateTimeStamp || '-'}</b>
                        </Typography>
                     </>
                    )}
                  </Grid>
                  {/* dialog */}
                  <UserCancelCustomRequests open={cancelDialog} onClose={handleCancelDialogClose} orderInfo={selectedOrder?.orderInfo} orderID={selectedOrder?.orderID} fetchMyOrders={fetchMyOrders} type={'custom'} zIndex={1000}/>

                  <ProcessPayment open={paymentDialogOpen} onClose={handlePaymentDialogClose} requestData={selectedOrder} fetchMyOrders={fetchMyOrders} zIndex={1000} />

                  <ViewCustomProductDetails open={viewCustomizedProductDialog} onClose={handleViewCustomPrdClose} orderInfo={selectedOrder} />
                  {/* buttons */}
                  <Grid item xs={12} sm={6} md={1.5}>
                  {order.orderInfo?.orderStatus === 'Waiting for Approval' ? (
                        <>
                        <Button
                          type="submit"
                          fullWidth
                          onClick={() => handleViewCustomPrdOpen(order.orderInfo)}
                          variant="contained"
                          sx={{
                            backgroundColor: 'green', 
                            color: 'white', 
                            '&:hover': { backgroundColor: '#388E3C', color: 'white' },
                            '&:not(:hover)': { backgroundColor: '#4CAF50', color: 'white' },
                            mb: 1.5
                          }}
                        >
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: 14, padding: 0.5 }}>VIEW</Typography>
                        </Button>
                        <Button
                          type="submit"
                          fullWidth
                          onClick={() => handleCancelDialogOpen(order.orderInfo, order.orderID)}
                          variant="contained"
                          sx={{
                            backgroundColor: 'White',
                            '&:hover': { backgroundColor: '#943126', color: 'white' },
                            '&:not(:hover)': { backgroundColor: '#860000', color: 'white' },
                          }}
                        >
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: 14, padding: 0.5 }}>CANCEL</Typography>
                        </Button>
                        </>
                      ) : (
                        order.orderInfo?.orderStatus === 'Request Approved' ? (
                          <>
                            {order.orderInfo?.isPaid === true ? (
                              <>
                                <Button
                                  type="submit"
                                  fullWidth
                                  onClick={() => handleViewCustomPrdOpen(order.orderInfo)}
                                  variant="contained"
                                  sx={{
                                    backgroundColor: 'green', 
                                    color: 'white', 
                                    '&:hover': { backgroundColor: 'black', color: 'white' },
                                    '&:not(:hover)': { backgroundColor: '#232323', color: 'white' },
                                    mb: 1.5
                                  }}
                                >
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 14, padding: 0.5 }}>VIEW</Typography>
                                </Button>
                              </>
                            ) : (
                             <>
                              <Button
                                type="submit"
                                onClick={() => handlePaymentDialogOpen(order.orderID, order.orderInfo?.selectedEWallet, order.orderInfo?.amountToPay)}
                                fullWidth
                                variant="contained"
                                sx={{
                                  backgroundColor: 'green', 
                                  color: 'white', 
                                  '&:hover': { backgroundColor: '#388E3C', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#4CAF50', color: 'white' },
                                  mb: 0.8
                                }}
                              >
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14}, padding: 0.5 }}>PAY</Typography>
                              </Button>
                              <Button
                                type="submit"
                                fullWidth
                                onClick={() => handleViewCustomPrdOpen(order.orderInfo)}
                                variant="contained"
                                sx={{
                                  backgroundColor: 'green', 
                                  color: 'white', 
                                  '&:hover': { backgroundColor: 'black', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#232323', color: 'white' },
                                  mb: 0.8
                                }}
                              >
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14}, padding: 0.5 }}>VIEW</Typography>
                              </Button>
                              <Button
                                type="submit"
                                fullWidth
                                onClick={() => handleCancelDialogOpen(order.orderInfo, order.orderID)}
                                variant="contained"
                                sx={{
                                  backgroundColor: 'White',
                                  '&:hover': { backgroundColor: '#943126', color: 'white' },
                                  '&:not(:hover)': { backgroundColor: '#860000', color: 'white' },
                                }}
                              >
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14}, padding: 0.5 }}>CANCEL</Typography>
                              </Button>
                              </>
                            )} 
                          </>
                        ) : (
                         order.orderInfo?.orderStatus === 'Cancellation Requested' ? (
                          <Typography></Typography>
                         ) : (
                          <>
                          <Button
                            type="submit"
                            fullWidth
                            onClick={handleViewCustomPrdOpen}
                            variant="contained"
                            sx={{
                              backgroundColor: 'green', 
                              color: 'white', 
                              '&:hover': { backgroundColor: '#388E3C', color: 'white' },
                              '&:not(:hover)': { backgroundColor: '#4CAF50', color: 'white' },
                              mb: 1.5
                            }}
                          >
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14}, padding: 0.5 }}>VIEW</Typography>
                          </Button>
                          </>
                    )
                  ))}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            ))
          )}
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <Pagination
            count={Math.ceil(filteredOrders.length / itemsPerPage)}
            page={currentPage}
            onChange={paginate}
            color="primary"
          />
        </Box>
      </Box>
    </>
  );
};

export default MyCustomizationRequestsTable;
//