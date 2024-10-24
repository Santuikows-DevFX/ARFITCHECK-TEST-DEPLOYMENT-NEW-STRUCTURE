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
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useSnackbar } from 'notistack';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../../firebase';

const OrdersTable = () => {

  const [orders, setOrders] = useState([]);
  const [cookie] = useCookies(['?id']);

  const [cancelDialog, setCancelDialog] = useState(false);
  const [enableReceiveButton, setEnableReceiveButton] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectStatus, setSelectStatus] = useState('All');
  const [sortAmount, setSortAmount] = useState('');
  const [sortStatus, setSortStatus] = useState('');
  const [orderIDSearchQuery, setOrderIDSearchQuery] = useState('');

  const { enqueueSnackbar  } = useSnackbar();

  const itemsPerPage = 3;

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

  const checkIfOrderDelivered = (orderDateDelivery, orderID, isNotified) => {
    try {

      const deliveryDate = new Date(orderDateDelivery);
      const getCurrentDate = new Date();

      const timeDiff = getCurrentDate.getTime() - deliveryDate.getTime();
      const dayDiff = timeDiff / (1000 * 3600 * 24) // => 1 day = 1000 * 60 * 60 * 24

      //check natin if yung diff from curr date and updated date when delivered is est 1 day @ 8:30 something
      if (isNotified) {
        setEnableReceiveButton(prevState => ({
          ...prevState,
          [orderID]: true, 
        }));
      }

    }catch(error){
      console.log(error);
      
    }
  }

  const fetchMyOrders = async () => {
    try {
      const myOrderResponse = await axiosClient.get(`order/fetchMyOrder/${cookie['?id']}`);
      const mergedOrders = mergeOrders(myOrderResponse.data);
      setOrders(mergedOrders);

      myOrderResponse.data.map((dateDelivery) => {
        if(dateDelivery.orderInfo?.orderStatus === 'Parcel out for delivery' && dateDelivery?.orderID === dateDelivery.orderInfo?.associatedOrderID) {
          checkIfOrderDelivered(dateDelivery.orderInfo?.orderDateDelivery, dateDelivery.orderInfo?.associatedOrderID, dateDelivery.orderInfo?.isNotified)
        }
      })

    } catch (error) {
      console.log(error);
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

  const handleCancelDialogOpen = (orderInfo, orderID) => {

    const orderData = {
      orderInfo: orderInfo,
      orderID: orderID
    }

    setSelectedOrder(orderData);
    setCancelDialog(true);  
  };  

  const handleCancelDialogClose = () => setCancelDialog(false);

  const openImageInNewTab = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };
  
  const handleReceiveOrder = (orderID) => {
    Swal.fire({
      title: "Received the order?",
      icon: "question",
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#414a4c',
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        receiveOrder({ orderID, associatedOrderID: orderID });
      }
    });
  };

  const receiveOrder = async (receivedOrderData) => {
    try {

      const { data } = await axiosClient.post('/order/receiveMyOrder', receivedOrderData);
      enqueueSnackbar(`${data.message}`, { 
        variant: 'success',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'right'
        },
        autoHideDuration: 1800,
        style: {
          fontFamily: 'Kanit',
          fontSize: '16px'
        },
      });

    } catch (error) {
      console.log(error);
    }
  }

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
          MY ORDERS
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
                    fontSize: {xs: 12, md: 22},
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
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: 13, fontWeight: 500, color: 'black' }}>
                            <b>Qnt:</b> {order.orderInfo?.productQuantity.split(', ')[index]} <b>Size:</b> {order.orderInfo?.productSize.split(', ')[index] || '-'}
                          </Typography>
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
                          <Typography
                            sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: '#1F618D', cursor: 'pointer', textDecoration: 'underline' }}
                            onClick={() => openImageInNewTab(order.orderInfo?.receiptImage)}
                          >
                            <b>E-Wallet</b>
                          </Typography>
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
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', fontWeight: 'bold', color: 'black' }}>
                      STATUS
                    </Typography>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: '16px', color: statusColorPicker(order.orderInfo?.orderStatus) }}>
                     <b> {order.orderInfo?.orderStatus}</b>
                    </Typography>
                    {/* determine if the status is out for delivery, so we can show the tracking number */}
                    {order.orderInfo?.orderStatus === 'Parcel out for delivery' ? (
                       <>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                        Tracking #: {order.orderInfo?.trackingNumber}
                        </Typography>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                          Updated:  <b> {order.orderInfo?.updateTimeStamp}</b>
                        </Typography>
                       </>
                    ) : (
                      <Typography sx={{ fontFamily: 'Kanit', fontSize: '13px', color: 'black' }}>
                        Updated:  <b> {order.orderInfo?.updateTimeStamp || '-'}</b>
                      </Typography>
                    )}
                  </Grid>
                  {/* dialog */}
                  <UserCancelOrder open={cancelDialog} onClose={handleCancelDialogClose} orderInfo={selectedOrder?.orderInfo} orderID={selectedOrder?.orderID} fetchMyOrders={fetchMyOrders} type={'default'} zIndex={1000}/>
                  {/* buttons */}
                  <Grid item xs={12} sm={6} md={1.5}>
                  {order.orderInfo?.orderStatus === 'Waiting for Confirmation' ||
                      order.orderInfo?.orderStatus === 'Order Confirmed' ||
                      order.orderInfo?.orderStatus === 'Preparing Order to Ship' ? (
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
                        
                      ) : (
                        order.orderInfo.orderStatus === 'Cancellation Requested' ? (
                          <Typography></Typography>
                        ) : (
                          <Button
                            type="submit"
                            fullWidth
                            disabled={!enableReceiveButton[order?.orderID]}
                            onClick={() => handleReceiveOrder(order.orderID)}
                            variant="contained"
                            sx={{
                              backgroundColor: 'White',
                              '&:hover': { backgroundColor: '#196F3D', color: 'white' },
                              '&:not(:hover)': { backgroundColor:  !enableReceiveButton[order?.orderID] ? '#3d4242' :'#239B56', color: 'white' },
                              opacity: !enableReceiveButton[order?.orderID] ? 0.6 : 1,
                            }}
                          >
                            <Typography sx={{ fontFamily: 'Kanit', fontSize:{ xs: 14, md: 14 }, padding: 0.5 }}>RECEIVED</Typography>
                          </Button>
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

export default OrdersTable;
//