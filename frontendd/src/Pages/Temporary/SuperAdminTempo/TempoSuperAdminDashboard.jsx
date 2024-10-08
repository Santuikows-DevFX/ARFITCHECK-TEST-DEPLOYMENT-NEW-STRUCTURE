import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptIcon from '@mui/icons-material/Receipt'

import { useCookies } from 'react-cookie';
import axiosClient from '../../../axios-client';
import { Link } from 'react-router-dom';

import { LineChart } from '@mui/x-charts/LineChart';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

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
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  toolbar: {
  
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '20px',
  },
  card: {
    width: 'calc(25% - 10px)', 
    height: '200px', 
    backgroundColor: '#EAECEE', 
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)', 
  },
  dateRangePicker: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '20px',
  },
  chartContainer: {
    width: '100%',
    flexGrow: 1,
    marginTop: '20px',
    marginBottom: '20px',
  },
};

const TempSuperAdminDashboard = () => {

  const [selectedInterval, setSelectedInterval] = useState('daily');
  const [chartData, setChartData] = useState([
    { date: '2024-04-01', value: 1000 },
    { date: '2024-04-02', value: 1500 },
    { date: '2024-04-03', value: 2000 },
    { date: '2024-04-04', value: 2500 },
    { date: '2024-04-05', value: 3000 },
    { date: '2024-04-06', value: 3500 },
    { date: '2024-04-07', value: 4000 },
  ]);

  const [reportsData, setReportsData] = useState([])

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {

      const reportResponse = await axiosClient.get('order/getReportsData')
      if(reportResponse.data) {
        setReportsData(reportResponse.data)
      }
     
    } catch (error) {
      console.log(error);
    }
  };

  const handleIntervalChange = (event) => {
    setSelectedInterval(event.target.value);
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
          <Button component={Link} to="/transaction-history" variant="text" style={{ textTransform: 'none' }}>
            Transaction History
          </Button>
        </div>
      </Drawer>
      <main style={styles.content}>
        <div style={styles.toolbar} />
        <div style={styles.dateRangePicker}>
          <FormControl style={{ width: '30%' }}> 
            <InputLabel id="interval-label"></InputLabel>
            <Select
              labelId="interval-label"
              id="interval-select"
              value={selectedInterval}
              onChange={handleIntervalChange}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '20px' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
              <DatePicker />
            </DemoContainer>
          </LocalizationProvider>
        </div>
        <div style={styles.cardContainer}>
          <Card style={styles.card}>
            <CardContent style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6">Total Orders</Typography>
                <Typography variant="h6">{reportsData.totalOrders}</Typography>
              </div>
              <ReceiptIcon fontSize="large"/>
            </CardContent>
          </Card>
          <Card style={styles.card}>
            <CardContent style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6">Pending Orders</Typography>
                <Typography variant="h6">{reportsData.pendingOrders}</Typography>
                
              </div>
                <AccessTimeIcon fontSize="large"/>
            </CardContent>
          </Card>
          <Card style={styles.card}>
            <CardContent style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6">Completed Orders</Typography>
                <Typography variant="h6">{reportsData.completedOrders}</Typography>
                
              </div>
              <CheckCircleIcon fontSize="large"/>
            </CardContent>
          </Card>
          <Card style={styles.card}>
            <CardContent style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Typography variant="h6">Critical Level Products</Typography>
                <Typography variant="h6">0</Typography>
                
              </div>
              <WarningIcon fontSize="large"/>
            </CardContent>
          </Card>
        </div>
        <br />
        <br />
        <br />
        <br />
        <br />
        <div style={styles.chartContainer}>
          <Typography variant="h6">Revenue Chart</Typography>
          <LineChart
            xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
            series={[
              {
                data: [2, 5.5, 2, 8.5, 1.5, 5],
              },
            ]}
            height={300}
            margin={{ left: 30, right: 30, top: 30, bottom: 30 }}
            grid={{ vertical: true, horizontal: true }}
          />
        </div>
      </main>
    </div>
  );
};

export default TempSuperAdminDashboard;
