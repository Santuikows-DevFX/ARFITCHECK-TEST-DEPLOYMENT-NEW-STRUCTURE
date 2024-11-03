import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Pagination,
  MenuItem,
  FormControl, 
  Select,
  Grid,
  Button,
  TextField,
  Tooltip
} from '@mui/material';
import 'react-toastify/dist/ReactToastify.css';
import DownloadIcon from '@mui/icons-material/Download';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';

const TransactionHistoryTable = ({ mergedProductOrders }) => {

  const [currentPage, setCurrentPage] = useState(1);
  const [completedOrders, setCompletedOrders] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectStatus, setSelectStatus] = useState('All');
  const [sortAmount, setSortAmount] = useState('');
  const [sortStatus, setSortStatus] = useState('');
  const [orderIDSearchQuery, setOrderIDSearchQuery] = useState('');

  const [cookie] = useCookies(['?id'])

  const itemsPerPage = 3;

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

  const handleChangeDate = async (dateValue) => {
    try {
      const formattedDate = dayjs(dateValue).format('YYYY-MM-DD');
    
      let filteredOrders = [];
  
      const sortedDataByDate = await axiosClient.get(`/order/fetchTransactionHistoryDataByDate/${formattedDate}`);
      filteredOrders = sortedDataByDate.data;
  
      if (filteredOrders) {
        if (sortedDataByDate.data.message) {
          setCompletedOrders([]);
        } else {
          const mergedOrders = mergeOrders(filteredOrders);
          setCompletedOrders(mergedOrders);
        }
      }
    } catch (error) {
      console.log("Failed to fetch orders by date:", error);
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

  const paginate = (event, pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const sortedOrders = [...mergedProductOrders].sort((a, b) => {
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

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  return (
    <>
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
                  <MenuItem value="Order Completed">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Order Completed</Typography>
                  </MenuItem>
                  <MenuItem value="Order Cancelled">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Order Cancelled</Typography>
                  </MenuItem>
                  <MenuItem value="Request Rejected">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Request Rejected</Typography>
                  </MenuItem>
                  <MenuItem value="Request Cancelled">
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Request Cancelled</Typography>
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
                            order.orderInfo?.orderType === 'custom' && order.orderInfo.isPaid === false ? (
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
                  <Grid item xs={12} sm={6} md={1.5}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                      Status
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: order.orderInfo.orderStatus === 'Order Completed' ? '#27ae60' : '#e74c3c' }}>
                      <b> {order.orderInfo?.orderStatus === 'Order Completed' ? 'Order Delivered' : order.orderInfo?.orderStatus}</b>
                    </Typography>
                      {order.orderInfo.cancelReason === "None" && order.orderInfo.userCancelReason === "None" ? (
                          <>
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                              Tracking #: {order.orderInfo.trackingNumber}
                            </Typography>
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                              Updated: <b>{order.orderInfo.updateTimeStamp}</b>
                            </Typography>
                          </>
                      ) : (
                          order.orderInfo.userCancelReason === "None" ? (
                            <>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Reason: {order.orderInfo?.cancelReason  === 'User didn\'t pay in time' ? 'Auto Cancelled' : 'You Cancelled'} (<b>{order.orderInfo.cancelReason}</b>)
                              </Typography>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Updated: <b>{order.orderInfo.updateTimeStamp}</b>
                              </Typography>
                            </>
                          ) : (
                            <>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                              Reason: User Cancelled (<b>{order.orderInfo.userCancelReason}</b>)
                              </Typography>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 12, fontWeight: 400, color: 'black'}}>
                                Updated: <b>{order.orderInfo.updateTimeStamp}</b>
                              </Typography>
                            </>
                          )
                      )}
                  </Grid>
                  <Grid item xs={12} sm={6} md={1.5}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'gray', textAlign: "center"}}>
                       -
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )))}
        </Grid>
      </Box>
      <Pagination
        count={Math.ceil(filteredOrders.length / itemsPerPage)}
        page={currentPage}
        onChange={paginate}
        showFirstButton
        showLastButton
        color="primary"
        sx={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}
      />
    </Box>
    <div style={styles.modalContent}>
    </div>
  </>
  );
};

export default TransactionHistoryTable;
