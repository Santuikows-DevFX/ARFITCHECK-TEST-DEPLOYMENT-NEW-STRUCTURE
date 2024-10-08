import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';
import { Link } from 'react-router-dom';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const drawerWidth = 220;

const styles = {
  root: {
    display: 'flex',
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#ffffff', 
    padding: '20px',
    textAlign: 'center',
  },
  avatar: {
    width: '150px',
    height: '150px',
    margin: 'auto',
    marginBottom: '20px',
  },
  lineSeparator: {
    width: '100%',
    borderBottom: '1px solid #000000',
    marginBottom: '20px',
  },
};

const TempoMyOrders = () => {

  const [userInfo, setUserInfo] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cookie] = useCookies(['?id']);

  useEffect(() => {
    fetchInfos();
  }, []);

  const fetchInfos = async () => {
    try {
      const userResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      const ordersResponse = await axiosClient.get(`order/fetchMyOrder/${cookie['?id']}`);
      if (userResponse.data && ordersResponse.data) {
        setUserInfo(userResponse.data);
        const mergedOrders = mergeOrders(ordersResponse.data);
        setOrders(mergedOrders)

      }
    } catch (error) {
      console.log(error);
    }
  };

    const mergeOrders = (orders) => {
    const mergedOrders = [];
    const orderMap = new Map();
    
    orders.forEach((order) => {
        const key = `${order.orderInfo.orderDate}-${order.orderInfo.orderStatus}-${order.orderInfo.fullShippingAddress}`;
        if (orderMap.has(key)) {
            orderMap.get(key).orderInfo.productName += `, ${order.orderInfo.productName}`;
        } else {
        orderMap.set(key, order);
        }
    });
    
    orderMap.forEach((value) => {
        mergedOrders.push(value);
    });
    
    return mergedOrders;
    
    };

  return (
    <div style={styles.root}>
      <Drawer
        style={styles.drawer}
        variant="permanent"
        classes={{
          paper: styles.drawerPaper,
        }}
        anchor="left"
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Button component={Link} to="/userdashboard" variant="text" style={{ textTransform: 'none' }}>
            Account Settings
          </Button>
          <Button component={Link} to="#" variant="text" style={{ textTransform: 'none' }}>
            My Orders
          </Button>
          <Button component={Link} to="/shipping" variant="text" style={{ textTransform: 'none' }}>
            Shipping Details
          </Button>
        </div>
      </Drawer>
      <main style={styles.content}>
        <div style={styles.toolbar} />
        <Avatar alt="User Image" src={userInfo.profileImage} style={styles.avatar} />
        <Typography variant="h5" gutterBottom>
          {userInfo.firstName} {userInfo.lastName}
        </Typography>
        <div style={styles.lineSeparator}></div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Shipping Address</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.orderID}>
                    <TableCell>{order.orderInfo.orderDate}</TableCell>
                    <TableCell>{order.orderInfo.productName}</TableCell>
                    <TableCell><b>PHP {order.orderInfo.amountToPay}</b></TableCell>
                    <TableCell>E-Wallet</TableCell>
                    <TableCell>{order.orderInfo.fullShippingAddress}</TableCell>
                    <TableCell><b>{order.orderInfo.orderStatus}</b></TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}><b>No Orders Yet</b></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
};

export default TempoMyOrders;
