import React, { useEffect } from 'react'
import { Box, Typography, Divider, Grid, Avatar, IconButton, Button } from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import TransactionHistoryTable from '../../Components/Tables/TransactionHistoryTable';
import axiosClient from '../../axios-client';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import { onValue, ref } from 'firebase/database';
import { db } from '../../firebase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function TransactionHistory() {

  const [isLoading, setIsLoading] = React.useState(true);
  const [completedOrders, setCompletedOrders] = React.useState([]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const dbRef = ref(db, 'orders');
  
    const listener = onValue(dbRef, (snapshot) => {
      if (snapshot.exists()) {
        fetchOrders();
      } else {
        console.log("No data available");
      }
    }, (error) => {
      console.error("Error listening to Realtime Database: ", error);
    });
  
    return () => listener();
  }, [])

  const fetchOrders = async () => {
    try {
      const orderResponse = await axiosClient.get('order/fetchTransactionHistory');
      const mergedOrders = mergeOrders(orderResponse.data);
      setCompletedOrders(mergedOrders);
    } catch (error) {
      console.error(error);
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

  const handleSaveAsExcel = () => {
    try {

      const fields = ['Order ID','Order Date', 'Product', 'Quantity', 'Size', 'Amount', 'Payment Method', 'Shipping Address', 'Status'];

      const csvRows = completedOrders.map(order => {

        const orderID = `"${order?.orderID.replace(/-/g, '')}"`;
        const orderDate = order.orderInfo.orderDate;
        const orderedProducts = order.orderInfo.productName.split(', ').join(' | ');
        const orderedQuantity = order.orderInfo.productQuantity.split(', ').join(' | ');
        const orderedSize = order.orderInfo.productSize.split(', ').join(' | ');
        const orderedAmount = order.orderInfo.amountToPay.toFixed(2);
        const paymentMethod = order.orderInfo.paymentMethod === 'cash' ? 'Cash' : 'E-Wallet';
        const fullShippingAddress = `"${order.orderInfo.fullShippingAddress}"`;
        const orderStatus = order.orderInfo.orderStatus;
        
        return [orderID, orderDate, orderedProducts, orderedQuantity, orderedSize, orderedAmount, paymentMethod, fullShippingAddress, orderStatus].join(',');
      });

      //what this does is it joins the headers and the rows data together
      const csvContent = [fields.join(','), ...csvRows].join('\n'); 
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); //blob is the file explorer being opened when saving a file

      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);

      //getting the date today
      const dateToday = dayjs().format('YYYY-MM-DD');

      link.setAttribute('href', url);
      link.setAttribute('download', `${dateToday}_transaction_order_history.csv`);

      link.style.visibility = 'hidden';
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

    }catch(error) {
      console.log(error);
    }
  }

  const handleSaveAsPDF = () => {
    try {
      const dateToday = dayjs().format('YYYY-MM-DD');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const boxWidth = pageWidth - 20; // Total width for the title section
      const boxHeight = 10; // Height for each row
      
      const titleStartX = 10;
      const titleStartY = 15;
      doc.rect(titleStartX, titleStartY, boxWidth, boxHeight);
      doc.setFont('Kanit', 'bold');
      doc.setFontSize(20);
      doc.text('B.MIC CLOTHES', pageWidth / 2, titleStartY + boxHeight / 2 + 3, { align: 'center' });
  
      const subtitleStartY = titleStartY + boxHeight;
      doc.rect(titleStartX, subtitleStartY, boxWidth, boxHeight);
      doc.setFontSize(16);
      doc.text('TRANSACTION HISTORY', pageWidth / 2, subtitleStartY + boxHeight / 2 + 3, { align: 'center' });
  
      const dateRowStartY = subtitleStartY + boxHeight;
      const halfBoxWidth = boxWidth / 2; 
      doc.rect(titleStartX, dateRowStartY, halfBoxWidth, boxHeight);
      doc.setFontSize(12);
      doc.setFont('Kanit', 'normal');
      doc.text(`DATE: ${dateToday}`, titleStartX + 5, dateRowStartY + boxHeight / 2 + 3);
  
      doc.rect(titleStartX + halfBoxWidth, dateRowStartY, halfBoxWidth, boxHeight);
      doc.text('Additional:', titleStartX + halfBoxWidth + 5, dateRowStartY + boxHeight / 2 + 3);
  
      const dividerY = dateRowStartY + boxHeight;
      doc.line(10, dividerY, pageWidth - 10, dividerY);
  
      const headers = [
        ['Order ID', 'Order Date', 'Product', 'Quantity', 'Size', 'Amount', 'Payment Method', 'Shipping Address', 'Status']
      ];
  
      const data = completedOrders.map(order => {
        const orderID = `${order.orderID}`;
        const orderDate = order.orderInfo.orderDate;
        const orderedProducts = order.orderInfo.productName.split(', ').join(' | ');
        const orderedQuantity = order.orderInfo.productQuantity.split(', ').join(' | ');
        const orderedSize = order.orderInfo.productSize.split(', ').join(' | ');
        const orderedAmount = order.orderInfo.amountToPay.toFixed(2);
        const paymentMethod = order.orderInfo.paymentMethod === 'cash' ? 'Cash' : 'E-Wallet';
        const fullShippingAddress = `"${order.orderInfo.fullShippingAddress}"`;
        const orderStatus = order.orderInfo.orderStatus;
  
        return [
          orderID,
          orderDate,
          orderedProducts,
          orderedQuantity,
          orderedSize,
          orderedAmount,
          paymentMethod,
          fullShippingAddress,
          orderStatus
        ];
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
  
      doc.save(`${dateToday}_transaction_history.pdf`);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
        {isLoading ? (
        <PreLoader />
      ) : (
       <Box m={2} >
          <Grid container direction="column" spacing={2}>
            <Grid item container justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
                Transaction History
              </Typography>
              <Grid container spacing={4} sx={{ width: "45%" }}>
              <Grid item xs={6}>
                <Button
                  disabled = {isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: '#196F3D',
                    color: 'white',
                    '&:not(:hover)': { backgroundColor: isLoading ? '#414a4c' : '#317000', color: 'white' },
                    '&:hover': { backgroundColor: '#239B56' },
                    fontSize: { xs: 10, md: 16 },  
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    fontFamily: 'Kanit',
                    fontWeight: 'bold',
                    opacity: isLoading ? 0.7 : 1

                  }}
                  startIcon={<DownloadIcon />}
                  onClick={handleSaveAsExcel}

                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, padding: 0.5 }}> .CSV</Typography>
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  disabled = {isLoading}
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    color: 'white',
                    '&:not(:hover)': { backgroundColor: isLoading ? '#414a4c' : '#b7950b', color: 'white' },
                    '&:hover': { backgroundColor: '#d4ac0d' },
                    fontSize: { xs: 10, md: 16 },  
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    fontFamily: 'Kanit',
                    fontWeight: 'bold',
                    opacity: isLoading ? 0.7 : 1
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
       <TransactionHistoryTable mergedProductOrders={completedOrders}/>
     </Box>
      )}
    </div>
  )
}

export default TransactionHistory