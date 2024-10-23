import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Divider, Button, CircularProgress, Tooltip } from '@mui/material'; 
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import AddTaskIcon from '@mui/icons-material/AddTask';
import BuildIcon from '@mui/icons-material/Build';
import PreLoader from '../../Components/PreLoader';
import axiosClient from '../../axios-client';
import { BarChart } from '@mui/x-charts/BarChart';
import GroupIcon from '@mui/icons-material/Group';
import { LineChart } from '@mui/x-charts/LineChart';
import { onValue, ref } from 'firebase/database';
import { db } from '../../firebase';

function AnalyticsAndReports() {

  const [reportsData, setReportsData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
  });

  const [salesSummary, setSalesSummary] = useState({
    weeklySummary: 0,
    monthlySummary: 0,
    yearlySummary: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false)
  const [salesOptionsLoading, setSalesOptionsLoading] = useState(false)

  const [sortOption, setSelectedOption] = useState('Weekly');
  const [currentRevenue, setCurrentRevenue] = useState([0]);
  const [pastRevenue, setPastRevenue] = useState([0]);
  const [xLabels, setXLabels] = useState([]); 
  const [currData, setCurrData] = useState([]);
  const [prevData, setPrevData] = useState([]);

  const [pastText, setPastText] = useState('Last Week');
  const [currentText, setCurrentText] = useState('Current Week');

  const dataSets = {
    Weekly: {
      xLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      currData: [4000, 3000, 2000, 2780, 1890, 2390, 3490],
      prevData: [2400, 1398, 9800, 3908, 4800, 3800, 4300],
    },
    Monthly: {
      xLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      currData: [10000, 20000, 15000, 25000],
      prevData: [8000, 18000, 13000, 22000],
    },
    Yearly: {
      xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      currData: [40000, 50000, 60000, 70000, 80000, 90000, 100000, 110000, 120000, 130000, 140000, 150000],
      prevData: [35000, 45000, 55000, 65000, 75000, 85000, 95000, 105000, 115000, 125000, 135000, 145000],
    },
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    setReportsLoading(true)
    setTimeout(() => {
      setReportsLoading(false)
    }, 3000)
  }, [])

  useEffect(() => {
    const dbRef = ref(db, 'orders');
  
    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchSalesAnalytics();
        handleFetchReportsData(sortOption);
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error listening to Realtime Database: ", error);
    });
  
    return () => listener();
  }, [sortOption]);
  

  const handleFetchReportsData = async (option) => {
    try {

      setSalesOptionsLoading(true);

      setSelectedOption(option);

      if(option === 'Daily') {
        setPastText('Yesterday');
        setCurrentText('Today');
      } else if(option === 'Weekly') {
        setPastText('Previous Week');
        setCurrentText('Current Week');
      } else if(option === 'Monthly') {
        setPastText('Previous Month');
        setCurrentText('Current Month');
      } else {
        setPastText('Previous Year');
        setCurrentText('Current Year');
      }

      const fetchSalesReportData = await axiosClient.post(`/rprt/calculateAnalyticsReports`, { dataSort: option });
      // const reportResponse = await axiosClient.get('order/getReportsData');
      // const salesSummaryResponse = await axiosClient.get('rprt/fetchSalesSummary');
      
      const getDataSets = dataSets[option];

      if (fetchSalesReportData.data) {

        const todayRevenue = fetchSalesReportData.data.currSales || 0;
        const yesterdayRevenue = fetchSalesReportData.data.pastSales || 0;

        console.log(fetchSalesReportData.data);
        
        //displaying the data on the legend thingy 
        setCurrentRevenue(todayRevenue);
        setPastRevenue(yesterdayRevenue);

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weeksForMonth = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
        const monthsForYear = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let labelMapper = [];
        if(option === 'Weekly') {
          labelMapper = daysOfWeek;
        }else if (option === 'Monthly') { 
          labelMapper = weeksForMonth
        }else {
          labelMapper = monthsForYear
        }
        // console.log(fetchSalesReportData.data)
        
        //line graph data
        setCurrData(labelMapper.map(day => fetchSalesReportData.data.currentRevenue[day] || 0));
        setPrevData(labelMapper.map(day => fetchSalesReportData.data.pastRevenue[day] || 0))
        setXLabels(getDataSets.xLabels)

        setSalesOptionsLoading(false)

      }
    } catch (error) {
      setSalesOptionsLoading(false)
      console.log(error);
    }
  };

  const fetchSalesAnalytics = async () => {
    try {

      const reportResponse = await axiosClient.get('order/getReportsData');
      const salesSummaryResponse = await axiosClient.get('rprt/fetchSalesSummary');

      if(salesSummaryResponse.data && reportResponse.data) {
        //reports data => cards on top, while sales summary is yung parang % difference
        setReportsData(reportResponse.data);
        setSalesSummary(salesSummaryResponse.data)
      }

    }catch(error) {
      console.log(error);
      
    }
  }

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <Box m={2} height="100vh">
          <Grid container direction="column" spacing={2}>
            <Grid item container justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
                Analytics and Reports
              </Typography>
            </Grid>
            <Grid item>
              <Divider sx={{ borderTopWidth: 2, mb: 2.5 }} />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>Indicates the total users registered in ARFITCHECK.</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #A00000, #C62128)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5, position: 'relative' }}>
                <GroupIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Total Users
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.totalUsers || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>Indicates the total number of pending orders.</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #f1c40f, #9a7d0a)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5 }}>
                <HourglassEmptyIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Pending Orders
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.pendingOrders || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>Indicates the total number of completed orders.</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #28b463, #196f3d)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5 }}>
                <AddTaskIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Completed Orders
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.completedOrders || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>Indicates the total number of customization requests. It includes the completed requests</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #3498db, #21618c)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5 }}>
                <BuildIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Customization Requests
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.customizedOrders || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>Indicates the total number of products available..</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #f39c12, #935116)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5 }}>
                <LocalMallIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Total Products
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.totalProducts || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
            <Grid item xs={12}>
                <Box sx={{ 
                    width: '98%',
                    bgcolor: 'white', 
                    p: 3, 
                    borderRadius: 5, 
                    boxShadow: 5, 
                    mx: 'auto',
                    mb: 3
                  }}>
                  <Grid item>
                    <Grid container justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', color: 'black', fontSize: 40 }}>
                        SALES CHART
                      </Typography>
                      <Box>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={sortOption === 'Weekly' || salesOptionsLoading}
                          sx={{
                            mx: 1,
                            fontFamily: 'Kanit',
                            fontSize: 16,
                            borderRadius: 2,
                            backgroundColor: "White",
                            "&:hover": {
                              backgroundColor: "#414a4c",
                              color: "white",
                            },
                            "&:not(:hover)": {
                              backgroundColor: "#3d4242",
                              color: "white",
                            },
                            background:
                              "linear-gradient(to right, #414141, #000000)",
                            opacity: sortOption === 'Weekly' || salesOptionsLoading ? 0.6 : 1,
                          }}
                          onClick={() => handleFetchReportsData('Weekly')}
                        >
                          Week
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={sortOption === 'Monthly' || salesOptionsLoading}
                          sx={{
                            mx: 1,
                            fontFamily: 'Kanit',
                            fontSize: 16,
                            borderRadius: 2,
                            backgroundColor: "White",
                            "&:hover": {
                              backgroundColor: "#414a4c",
                              color: "white",
                            },
                            "&:not(:hover)": {
                              backgroundColor: "#3d4242",
                              color: "white",
                            },
                            background:
                              "linear-gradient(to right, #414141, #000000)",
                            opacity: sortOption === 'Monthly' || salesOptionsLoading ? 0.6 : 1,
                          }}
                          onClick={() => handleFetchReportsData('Monthly')}
                        >
                          Month
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          disabled={sortOption === 'Yearly' || salesOptionsLoading}
                          sx={{
                            mx: 1,
                            fontFamily: 'Kanit',
                            fontSize: 16,
                            borderRadius: 2,
                            backgroundColor: "White",
                            "&:hover": {
                              backgroundColor: "#414a4c",
                              color: "white",
                            },
                            "&:not(:hover)": {
                              backgroundColor: "#3d4242",
                              color: "white",
                            },
                            background:
                              "linear-gradient(to right, #414141, #000000)",
                            opacity: sortOption === 'Yearly' || salesOptionsLoading ? 0.6 : 1,
                            
                          }}
                          onClick={() => handleFetchReportsData('Yearly')}
                        >
                          Year
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 20 }}>
                      <Box sx={{ width: 13, height: 13, bgcolor: '#3498db', mr: 1, borderRadius: 2 }} />
                      <Typography variant="body1" sx={{ fontFamily: 'Kanit', fontWeight: 'medium', color: 'black', fontSize: { xs: 14, md: 18 } }}>
                        {pastText} - ₱{pastRevenue}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: 13, height: 13, bgcolor: '#e74c3c', mr: 1, borderRadius: 2 }} />
                      <Typography variant="body1" sx={{ fontFamily: 'Kanit', fontWeight: 'medium', color: 'black', fontSize: { xs: 14, md: 18 } }}>
                        {currentText} - ₱{currentRevenue} ({sortOption === 'Weekly' ? (
                          <span style={{ fontWeight: 'bold', color: salesSummary.weeklySummary < 0 ? '#e74c3c' : '#27ae60' }}>
                           <span style={{ fontSize: '0.75em' }}>{salesSummary.weeklySummary < 0 ? '▼' : '▲'}</span>{salesSummary.weeklySummary}% 
                          </span>
                        ) : (
                          sortOption === 'Monthly' ? (
                            <span style={{ fontWeight: 'bold', color: salesSummary.monthlySummary < 0 ? '#e74c3c' : '#27ae60' }}>
                              <span style={{ fontSize: '0.75em' }}>{salesSummary.monthlySummary < 0 ? '▼' : '▲'}</span>{salesSummary.monthlySummary}% 
                            </span>
                          ) : (
                            <span style={{ fontWeight: 'bold', color: salesSummary.yearlySummary < 0 ? '#e74c3c' : '#27ae60' }}>
                              <span style={{ fontSize: '0.75em' }}>{salesSummary.yearlySummary < 0 ? '▼' : '▲'}</span>{salesSummary.yearlySummary}% 
                            </span>
                          )
                        )})
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* <BarChart
                      xAxis={[{ data: ['Sales'], scaleType: 'band'}]}
                      series={[
                        {
                          data: pastRevenue,
                          color: '#3498db',
                        },
                        {
                          data: currentRevenue,
                          color: '#e74c3c',
                        },
                      ]}
                      height={500}
                      width={880}
                    /> */}
                     <LineChart
                        width={1200}
                        height={500}
                        series={[
                          { data: currData, color: '#e74c3c'  },
                          { data: prevData, color: '#3498db' },
                        ]}
                        xAxis={[{ scaleType: 'point', data: xLabels }]}
                      />
                  </Box>
                </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </div>
  );
}

export default AnalyticsAndReports;