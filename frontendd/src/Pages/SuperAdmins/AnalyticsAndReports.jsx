import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Divider, Button, CircularProgress, Tooltip } from '@mui/material'; 
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import AddTaskIcon from '@mui/icons-material/AddTask';
import BuildIcon from '@mui/icons-material/Build';
import PreLoader from '../../Components/PreLoader';
import axiosClient from '../../axios-client';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { LineChart } from '@mui/x-charts/LineChart';
import { off, onValue, ref } from 'firebase/database';
import { db } from '../../firebase';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

function AnalyticsAndReports() {

  document.documentElement.style.setProperty('--primary', 'black');

  const [reportsData, setReportsData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    cancelledOrder: 0
  });

  const [salesSummary, setSalesSummary] = useState({
    weeklySummary: 0,
    monthlySummary: 0,
    yearlySummary: 0
  });

  //for generating reports purposes
  const [allSalesReports, setAllSalesReport] = useState({
    weeeklyCurrentRevenue: 0,
    weeklyLastRevenue: 0,
    monthlyCurrentRevenue: 0,
    monthlyLastRevenue: 0,
    yearlyCurrentRevenue: 0,
    yearlyLastRevenue: 0
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
  
    return () => {
      off(dbRef); 
      listener();
    };
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
      const allSalesSummaryResponse = await axiosClient.get('rprt/fetchAllSalesReport');

      if(salesSummaryResponse.data && reportResponse.data && allSalesSummaryResponse.data) {
        //reports data => cards on top, while sales summary is yung parang % difference
        setReportsData(reportResponse.data);
        setSalesSummary(salesSummaryResponse.data);
        setAllSalesReport(allSalesSummaryResponse.data);
      }

    }catch(error) {
      console.log(error);
      
    }
  }

  const handleSaveAsPDF = () => {
    try {
      const dateToday = dayjs().format('YYYY-MM-DD');
  
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
  
      //Define the total width for the section
      const boxWidth = pageWidth - 20; //Total width for the title section
      const halfBoxWidth = boxWidth / 2;//Width for each half in the Date row
      const boxHeight = 10; //Height for each row
  
      const titleStartX = 10;
      const titleStartY = 15;
      doc.rect(titleStartX, titleStartY, boxWidth, boxHeight);
      doc.setFont('Kanit', 'bold');
      doc.setFontSize(20);
      doc.text('B.MIC CLOTHES', pageWidth / 2, titleStartY + boxHeight / 2 + 3, { align: 'center' });
  
      const subtitleStartY = titleStartY + boxHeight;
      doc.rect(titleStartX, subtitleStartY, boxWidth, boxHeight);
      doc.setFontSize(16);
      doc.text('ANALYTICS AND REPORTS', pageWidth / 2, subtitleStartY + boxHeight / 2 + 3, { align: 'center' });
  
      const dateRowStartY = subtitleStartY + boxHeight;
  
      doc.rect(titleStartX, dateRowStartY, halfBoxWidth, boxHeight);
      doc.setFontSize(12);
      doc.setFont('Kanit', 'normal');
      doc.text(`DATE: ${dateToday}`, titleStartX + 5, dateRowStartY + boxHeight / 2 + 3);
  
      doc.rect(titleStartX + halfBoxWidth, dateRowStartY, halfBoxWidth, boxHeight);
      doc.text('Additional:', titleStartX + halfBoxWidth + 5, dateRowStartY + boxHeight / 2 + 3);
  
      const dividerY = dateRowStartY + boxHeight;
      doc.line(10, dividerY, pageWidth - 10, dividerY);
  
      const headers = [
        ['Report Type', 'Cancelled Orders', 'Pending Orders', 'Completed Orders', 'Customized Requests', 'Total Products', 'Current Revenue', 'Previous Revenue']
      ];
  
      const data = [
        [
          'Overall Reports Data',
          reportsData.cancelledOrder,
          reportsData.pendingOrders,
          reportsData.customizedOrders,
          reportsData.cancelledOrder,
          reportsData.totalProducts,
          '-', 
          '-' 
        ]
      ];
      const timeFrames = ['Weekly', 'Monthly', 'Yearly'];
      timeFrames.forEach((timeFrame) => {
        let currentRevenue, previousRevenue;
  
        if (timeFrame === 'Weekly') {
          currentRevenue = currData.reduce((acc, val) => acc + val, 0);
          previousRevenue = prevData.reduce((acc, val) => acc + val, 0);
        } else if (timeFrame === 'Monthly') {
          currentRevenue = allSalesReports.monthlyCurrentRevenue;
          previousRevenue = allSalesReports.monthlyLastRevenue;
        } else if (timeFrame === 'Yearly') {
          currentRevenue = allSalesReports.yearlyCurrentRevenue;
          previousRevenue = allSalesReports.yearlyLastRevenue;
        }
  
        data.push([
          timeFrame,
          '', '', '', '', '',
          currentRevenue,
          previousRevenue
        ]);
      });
  
      doc.autoTable({
        head: headers,
        body: data,
        startY: dividerY + 5, 
        theme: 'grid',
        styles: {
          font: 'Kanit',
          fontSize: 10,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: { fillColor: [41, 128, 185] }, 
        alternateRowStyles: { fillColor: [220, 234, 246] }
      });
  
      const tableEndY = doc.lastAutoTable.finalY; 
  
      const tableDividerY = tableEndY + 10; 
      doc.line(10, tableDividerY, pageWidth - 10, tableDividerY);
  
      doc.save(`${dateToday}_analytics_report.pdf`);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveAsExcel = () => {
    try {
      const headers = [
        'Report Type',
        'Cancelled Orders',
        'Pending Orders',
        'Completed Orders',
        'Customized Requests',
        'Total Products',
        'Current Revenue',
        'Previous Revenue',
      ];
  
      const data = [
        ['Generated Analytical Reports'],
        [''], 
        headers,
        [
          'Overall Reports Data',
          reportsData.cancelledOrder,
          reportsData.pendingOrders,
          reportsData.completedOrders,
          reportsData.customizedOrders,
          reportsData.totalProducts,
          '', 
          '', 
        ],
        [''], 
      ];
  
      const timeFrames = ['Weekly', 'Monthly', 'Yearly'];
      timeFrames.forEach((timeFrame) => {
        let currentRevenue, previousRevenue;
  
        if (timeFrame === 'Weekly') {
          currentRevenue = currData.reduce((acc, val) => acc + val, 0);
          previousRevenue = prevData.reduce((acc, val) => acc + val, 0);
        } else if (timeFrame === 'Monthly') {
          currentRevenue = allSalesReports.monthlyCurrentRevenue;
          previousRevenue = allSalesReports.monthlyLastRevenue;
        } else if (timeFrame === 'Yearly') {
          currentRevenue = allSalesReports.yearlyCurrentRevenue;
          previousRevenue = allSalesReports.yearlyLastRevenue;
        }
  
        data.push([
          timeFrame,
          '', '', '', '', '', 
          currentRevenue,
          previousRevenue,
        ]);
      });
  
      const ws = XLSX.utils.aoa_to_sheet(data);
  
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }, 
      ];
  
      Object.keys(ws).forEach((cell) => {
        if (ws[cell] && cell.startsWith('A')) { 
          ws[cell].s = {
            font: { name: 'Kanit', sz: 12, bold: true },
            fill: { fgColor: { rgb: 'D9EAD3' } },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        }
      });
  
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Analytics Report');
  
      const dateToday = dayjs().format('YYYY-MM-DD');
      XLSX.writeFile(wb, `${dateToday}_analytics_report.xlsx`);
    } catch (error) {
      console.error(error);
    }
  };

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
              <Grid container spacing={4} sx={{ width: "45%" }}>
              <Grid item xs={6}>
              <Button
                  disabled = {reportsLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    color: 'white',
                    '&:not(:hover)': { backgroundColor: reportsLoading ? '#414a4c' : '#196F3D', color: 'white' },
                    '&:hover': { backgroundColor: '#239B56' },
                    fontSize: { xs: 10, md: 16 },  
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    fontFamily: 'Kanit',
                    fontWeight: 'bold',
                    opacity: reportsLoading ? 0.7 : 1
                  }}
                  startIcon={<DownloadIcon />}
                  onClick={handleSaveAsExcel}

                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, padding: 0.5 }}> .CSV</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  disabled = {reportsLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    color: 'white',
                    '&:not(:hover)': { backgroundColor: reportsLoading ? '#414a4c' : '#b7950b', color: 'white' },
                    '&:hover': { backgroundColor: '#d4ac0d' },
                    fontSize: { xs: 10, md: 16 },  
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    fontFamily: 'Kanit',
                    fontWeight: 'bold',
                    opacity: reportsLoading ? 0.7 : 1
                  }}
                  startIcon={<DownloadIcon />}
                  onClick={handleSaveAsPDF}

                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, padding: 0.5 }}> .PDF</Typography>
                </Button>
              </Grid>
            </Grid>
            </Grid>
            <Grid item>
              <Divider sx={{ borderTopWidth: 2, mb : 3 }}/>
            </Grid>
          </Grid>
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14} }}>Indicates the total number of cancelled orders. It also includes cancelled customization requests.</Typography>} 
             placement="top" arrow>
              <Box sx={{ background: 'linear-gradient(to right, #A00000, #C62128)', textAlign: 'center', padding: '20px', borderRadius: 5, boxShadow: 5, position: 'relative' }}>
                <HighlightOffIcon sx={{ fontSize: { xs: 30, md: 40 }, color: 'white' }} />
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, md: 20 }, fontWeight: 'medium', color: 'white' }}>
                  Cancelled Orders
                </Typography>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'white' }}>
                  {reportsLoading ? <CircularProgress sx={{ color: 'white' }} /> : reportsData.cancelledOrder || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Tooltip 
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14} }}>Indicates the total number of pending orders.</Typography>} 
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
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14} }}>Indicates the total number of completed orders.</Typography>} 
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
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14} }}>Indicates the total number of customization requests. It includes the completed requests</Typography>} 
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
             title={<Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 12, md: 14} }}>Indicates the total number of products available..</Typography>} 
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
                      <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', color: 'black', fontSize: {xs: 25, md: 40} }}>
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