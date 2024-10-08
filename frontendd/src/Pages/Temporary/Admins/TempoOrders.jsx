import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import { useCookies } from 'react-cookie';
import axiosClient from '../../../axios-client';
import { Link } from 'react-router-dom';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';


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
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  addButton: {
    position: 'absolute',
    top: '10px',
    left: '20px',
  },
  tableContainer: {
    width: '100%',
    marginTop: '20px',
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    width: '150px',
    marginBottom: '5px',
    fontSize: '0.6rem',
  },
  tableRow: {
    fontSize: '0.8rem',
    textAlign: 'center', 
  },
};

const TempoOrders = () => {
  const [userInfo, setUserInfo] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchOrders();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      if (userResponse.data) {
        setUserInfo(userResponse.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchOrders = async () => {
    try {
      const dummyOrders = [
        {
          orderNumber: '-NLaaxq12ca',
          orderDate: '2024-04-12 12:59 PM',
          product: 'Tae',
          totalAmount: 69,
          paymentMethod: 'E-Wallet',
          shippingAddress: '57 Malinta - Malupet, Valenzuela, 1447, Philippines',
        },
      ];

      setOrders(dummyOrders);
    } catch (error) {
      console.log(error);
    }
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
          <Button component={Link} to="/analytics" variant="text" style={{ textTransform: 'none' }}>
            Analytics and Reports
          </Button>
          <Button component={Link} to="/team" variant="text" style={{ textTransform: 'none' }}>
            Staff
          </Button>
          <Button component={Link} to="/inventory" variant="text" style={{ textTransform: 'none' }}>
            Product Inventory
          </Button>
          <Button component={Link} to="/orders" variant="text" style={{ textTransform: 'none' }}>
            Orders
          </Button>
          <Button component={Link} to="/transaction" variant="text" style={{ textTransform: 'none' }}>
            Transaction History
          </Button>
        </div>
      </Drawer>
      <main style={styles.content}>
      <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DemoContainer components={['DatePicker']}>
            <DatePicker />
          </DemoContainer>
        </LocalizationProvider>
      </div>
        <h1>
          Order Status
        </h1>
        <Button
            variant="outlined"
            style={{
              ...styles.button,
              width: '200px',
              borderColor: 'green', 
              color: 'green', 
              fontWeight: 'bold'
            }}
          >
          Download as Excel
        </Button>
        <Divider style={{ width: '100%', marginBottom: '20px' }} />
        <TableContainer component={Paper} style={styles.tableContainer}>
          <Table style={styles.table}>
            <TableHead>
              <TableRow style={styles.tableRow}>
                <TableCell style={{ textAlign:'center' }}>Order ID</TableCell>
                <TableCell style={{ textAlign:'center' }}>Order Date</TableCell>
                <TableCell style={{ textAlign:'center' }}>Product</TableCell>
                <TableCell style={{ textAlign:'center' }}>Amount</TableCell>
                <TableCell style={{ textAlign:'center' }}>Payment Method</TableCell>
                <TableCell style={{ textAlign:'center' }}>Shipping Address</TableCell>
                <TableCell style={{ minWidth: '150px', textAlign: 'center' }}>Order</TableCell>
                <TableCell style={{ textAlign:'center' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} style={styles.tableRow}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.totalAmount}</TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>{order.shippingAddress}</TableCell>
                  <TableCell><b>Waiting For Confirmation</b></TableCell>
                  <TableCell>
                    <div style={styles.buttonContainer}>
                      <Button
                        variant="contained"
                        style={{ ...styles.button, backgroundColor: '#4CAF50', color: 'white' }}
                      >
                        Confirm Order
                      </Button>
                      <Button
                        variant="contained"
                        style={{ ...styles.button, backgroundColor: 'red', color: 'white' }}
                      >
                        Cancel Order
                      </Button>
                      <Button
                        variant="contained"
                        style={{ ...styles.button, backgroundColor: 'yellow', color: 'black' }}
                      >
                        Prepare Order
                      </Button>
                      <Button
                        variant="contained"
                        style={{ ...styles.button, backgroundColor: 'blue', color: 'white' }}
                      >
                        Deliver Order
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
};

export default TempoOrders;
