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
  tableContainer: {
    width: '100%',
    marginTop: '20px',
    overflowX: 'auto',
  },
  table: {
    minWidth: 650,
  },
  tableRow: {
    fontSize: '0.8rem',
    textAlign: 'center', 
  },
  button: {
    width: '150px',
    marginBottom: '5px',
    fontSize: '0.6rem',
  },
};

const TempoTransaction = () => {
  const [userInfo, setUserInfo] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchTransactions();
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

  const fetchTransactions = async () => {
    try {
      const dummyTransactions = [
        {
          transactionNumber: '-Nasawx12czdsaX',
          transactionDate: '2024-04-12 01:15 PM',
          product: 'Tae',
          totalAmount: 69,
          paymentMethod: 'E-Wallet',
          status: 'Completed',
        },
      ];

      setTransactions(dummyTransactions);
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
        <h1>Transaction History</h1>
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
                <TableCell style={{ textAlign:'center' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index} style={styles.tableRow}>
                  <TableCell  style={{ textAlign:'center' }}>{transaction.transactionNumber}</TableCell>
                  <TableCell style={{ textAlign:'center' }}>{transaction.transactionDate}</TableCell>
                  <TableCell  style={{ textAlign:'center' }}>{transaction.product}</TableCell>
                  <TableCell  style={{ textAlign:'center' }}>{transaction.totalAmount}</TableCell>
                  <TableCell  style={{ textAlign:'center' }}>{transaction.paymentMethod}</TableCell>
                  <TableCell  style={{ textAlign:'center' }}><b>{transaction.status}</b></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </main>
    </div>
  );
};

export default TempoTransaction;
