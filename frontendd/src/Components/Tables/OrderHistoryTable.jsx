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
  TextField,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import 'react-toastify/dist/ReactToastify.css';
import ProductRating from '../Dialogs/ProductRating';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../../firebase';

const OrderHistoryTable = () => {

  const [orders, setOrders] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [sortAmount, setSortAmount] = useState('');
  const [sortStatus, setSortStatus] = useState('');
  const [orderIDSearchQuery, setOrderIDSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectStatus, setSelectStatus] = useState('All');
  const [orderID, setOrderID] = useState('');

  const [openRatingModal, setRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const dbRef = ref(db, 'orders');
  
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
      const myOrderResponse = await axiosClient.get(`order/fetchCompletedOrder/${cookie['?id']}`);
      if (myOrderResponse.data) {
        const mergedOrders = mergeOrders(myOrderResponse.data);
        setOrders(mergedOrders);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const mergeOrders = (orders) => {
    const mergedOrders = [];
    const orderMap = new Map();

    orders.forEach((order) => {
      const key = order.orderInfo?.associatedOrderID === "None" ? order.orderID : order.orderInfo.associatedOrderID;

      if (orderMap.has(key)) {
        const existingOrder = orderMap.get(key);

        existingOrder.orderInfo.productName += `, ${order.orderInfo.productName}`;

        if (typeof existingOrder.orderInfo.productQuantity === 'string') {
          existingOrder.orderInfo.productQuantity += `, ${order.orderInfo.productQuantity}`;
        } else {
          existingOrder.orderInfo.productQuantity = `${existingOrder.orderInfo.productQuantity}, ${order.orderInfo.productQuantity}`;
        }

        existingOrder.orderInfo.productSize += `, ${order.orderInfo.productSize}`;

        // Combine size quantities
        existingOrder.orderInfo.smallQnt += order.orderInfo.smallQnt;
        existingOrder.orderInfo.mediumQnt += order.orderInfo.mediumQnt;
        existingOrder.orderInfo.largeQnt += order.orderInfo.largeQnt;
        existingOrder.orderInfo.extraLargeQnt += order.orderInfo.extraLargeQnt;
        existingOrder.orderInfo.doubleXLQnt += order.orderInfo.doubleXLQnt;
        existingOrder.orderInfo.tripleXLQnt += order.orderInfo.tripleXLQnt;

      } else {
        if (typeof order.orderInfo.productQuantity !== 'string') {
          order.orderInfo.productQuantity = `${order.orderInfo.productQuantity}`;
        }

        orderMap.set(key, order);
      }
    });

    orderMap.forEach((order) => {
      mergedOrders.push(order);
    });

    return mergedOrders;
  };

  const styles = {
    modalContent: {
      width: '100%',
      height: 'calc(100% - 64px)',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      marginTop: '-3.4%',
    },
  }

  const handleOpenRatingModal = (productInfo) => {

    setOrderID(productInfo.associatedOrderID)
    setSelectedOrder(productInfo)
    setRatingModal(true)
  }

  const handleCloseRatingModal = () => {
    setRatingModal(false)
  }

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const handleChangeDate = async (dateValue) => {
    try {
      const formattedDate = dayjs(dateValue).format('YYYY-MM-DD');
    
      let filteredOrders = [];
  
      const sortedDataByDate = await axiosClient.get(`/order/fetchMyOrderHistoryByDate/${cookie['?id']}/${formattedDate}`);
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

  const sortedOrders = [...orders].sort((a, b) => {

    if (sortAmount) {
      return sortAmount === 'asc'
        ? a.orderInfo.amountToPay - b.orderInfo.amountToPay
        : b.orderInfo.amountToPay - a.orderInfo.amountToPay;
    }
    if (sortStatus) {
      const statuses = ['Order Completed', 'Order Cancelled', 'Request Rejected', 'Request Cancelled'];
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
      link.setAttribute('download', `${dateToday}_my_order_history.csv`);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

    }catch(error) {
      console.log(error);
    }
  }

  return (
    <>
      <Box sx={{ position: 'relative', py: { xs: 1, md: 2 } }}>
        <Typography
          sx={{
            fontFamily: 'Kanit',
            fontSize: { xs: 25, md: 50 },
            fontWeight: 'bold',
            color: 'black',
            textAlign: 'center',
          }}
        >
          ORDER HISTORY
        </Typography>
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#196F3D',
            color: 'white',
            '&:hover': { backgroundColor: '#239B56' },
            fontSize: { xs: 10, md: 16 },  
            padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
            fontFamily: 'Kanit',
            fontWeight: 'bold',
          }}
          startIcon={<DownloadIcon />}
          onClick={handleSaveAsExcel}
        >
          Save as .CSV
        </Button>
      </Box>
      <Box sx={{ padding: '1rem', backgroundColor: '#FFFFFF', boxShadow: '2px 5px 10px rgba(0,0,0,0.4)' }}>
        <Box sx={{ flexGrow: 1 }}>
          {/* filters */}
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
                  <MenuItem value="Order Completed">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Order Completed</Typography>
                  </MenuItem>
                  <MenuItem value="Order Cancelled">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Order Cancelled</Typography>
                  </MenuItem>
                  <MenuItem value="Request Rejected">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Request Rejected</Typography>
                  </MenuItem>
                  <MenuItem value="Request Cancelled">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 20}, fontWeight: 'medium', color: 'black' }}>Request Cancelled</Typography>
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
                                <>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                                    <b>Qnt:</b> {order.orderInfo?.productQuantity.split(', ')[index]} <b>Size(s): </b>
                                    {order.orderInfo?.smallQuantity !== "0" ? `S x${order.orderInfo?.smallQuantity}${order.orderInfo?.mediumQuantity !== "0" || order.orderInfo?.largeQuantity !== "0" || order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.mediumQuantity !== "0" ? `M x${order.orderInfo?.mediumQuantity}${order.orderInfo?.largeQuantity !== "0" || order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.largeQuantity !== "0" ? `L x${order.orderInfo?.largeQuantity}${order.orderInfo?.extraLargeQuantity !== "0" || order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.extraLargeQuantity !== "0" ? `XL x${order.orderInfo?.extraLargeQuantity}${order.orderInfo?.doubleXLQuantity !== "0" || order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.doubleXLQuantity !== "0" ? `2XL x${order.orderInfo?.doubleXLQuantity}${order.orderInfo?.tripleXLQuantity !== "0" ? ', ' : ''}` : ''}
                                    {order.orderInfo?.tripleXLQuantity !== "0" ? `3XL x${order.orderInfo?.tripleXLQuantity}` : ''}
                                  </Typography>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                                    Custom Img: <span style={{ textDecoration: 'underline', fontFamily: 'Kanit', fontWeight: 'bold',color: '#1F618D', cursor: 'pointer' }} onClick = {() => {
                                      window.open(order.orderInfo?.customImage, '_blank')
                                    }}>Click Here</span>
                                  </Typography>
                                </>
                              
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
                                <Typography
                                  sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: '#1F618D', cursor: 'pointer', textDecoration: 'underline' }}
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
                    <Grid item xs={12} sm={6} md={1.5}>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                        Status
                      </Typography>
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: order.orderInfo?.orderStatus === 'Order Completed' ? '#27ae60' : '#e74c3c' }}>
                        <b> {order.orderInfo?.orderStatus}</b>
                      </Typography>
                        {order.orderInfo?.cancelReason === "None" && order.orderInfo?.userCancelReason === "None" ? (
                            <>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                {order.orderInfo?.trackingNumber}
                              </Typography>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Updated: <b>{order.orderInfo?.updateTimeStamp}</b>
                              </Typography>
                            </>
                        ) : (
                            order.orderInfo?.userCancelReason === "None" ? (
                              <>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                  Reason: {order.orderInfo?.orderType === 'default' ? 'Order' : 'Request'} Cancelled (<b>{order.orderInfo?.cancelReason}</b>)
                                </Typography>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                  Updated: <b>{order.orderInfo?.updateTimeStamp}</b>
                                </Typography>
                              </>
                            ) : (
                              <>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Reason: You Cancelled (<b>{order.orderInfo?.userCancelReason}</b>)
                                </Typography>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                  Updated: <b>{order.orderInfo?.updateTimeStamp}</b>
                                </Typography>
                              </>
                            )
                        )}
                    </Grid>
                      {/* buttons */}
                    <Grid item xs={12} sm={6} md={1.5}>
                    {order.orderInfo?.orderStatus === 'Order Cancelled' || order.orderInfo?.isRated === true || order.orderInfo?.orderStatus === 'Request Cancelled'  ? (
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'gray', textAlign: "center"}}>
                             -
                        </Typography>
                      ) : (
                        <Button
                          type="submit"
                          onClick={() => {handleOpenRatingModal(order.orderInfo)}}
                          fullWidth
                          variant="contained"
                          sx={{
                            backgroundColor: 'White',
                            '&:hover': { backgroundColor: '#196F3D', color: 'white' },
                            '&:not(:hover)': { backgroundColor: '#239B56', color: 'white' },
                          }}
                      >
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 14, padding: 0.5 }}>QUICK RATE</Typography>
                      </Button>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )))}
            <ProductRating open={openRatingModal} product={selectedOrder} onClose={handleCloseRatingModal} orderID={orderID} fetchMyOrders={fetchMyOrders} />
          </Grid>
        </Box>
        <Pagination
          count={Math.ceil(filteredOrders.length / itemsPerPage)}
          page={currentPage}
          onChange={paginate}
          color="primary"
          sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', fontFamily: 'Kanit' }}
        />
      </Box>
      <div style={styles.modalContent}>
      </div>
    </>
  );
};

export default OrderHistoryTable;