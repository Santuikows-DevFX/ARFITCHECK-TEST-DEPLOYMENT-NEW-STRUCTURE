import React, { useEffect } from 'react'
import{ useState } from 'react';
import { Box, Typography, Divider, Grid, Avatar, IconButton, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProductInventoryTable from '../../Components/Tables/ProductInventoryTable';
import PreLoader from '../../Components/PreLoader';
import AddProduct from '../../Components/Dialogs/AddProduct';
import axiosClient from '../../axios-client';
import { useCookies } from 'react-cookie';
import DownloadIcon from '@mui/icons-material/Download';
import dayjs from 'dayjs';
import { db } from '../../firebase';
import { off, onValue, ref } from 'firebase/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function ProductInventory() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [products, setProducts] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [cookie] = useCookies(['?role'])

    const handleButtonClick = () => {
      setIsDialogOpen(true);
    };
  
    const handleDialogClose = () => {
      setIsDialogOpen(false);
    };

    useEffect(() => {
      const dbRef = ref(db, 'products');
    
      const listener = onValue(dbRef, (snapshot) => {
        if (snapshot.exists()) {
          fetchProducts();
        }
      }, (error) => {
        console.error("Error listening to Realtime Database: ", error);
      });
    
      return () => {
        off(dbRef); 
        listener();
      };
    }, []);

    const fetchProducts = async () => {
  
      try {
        const productResponse = await axiosClient.get(`prd/getProducts/${cookie['?role']}`);
        const sortedProducts = productResponse.data.sort((a, b) => (b.productInfo.isCriticalLevel - a.productInfo.isCriticalLevel));
        setProducts(sortedProducts);
  
      } catch (error) {
        console.log(error);
      }
    };
  
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleSaveAsExcel = () => {
    try {

      const fields = ['Product ID', 'Product Name', 'Category', 'Product Quantity', 'Price', 'Total Sold'];

      const csvRows = products.map(products => {

        const productID = `"${products?.productID.replace(/-/g, '')}"`;
        const productName = products.productInfo?.productName.split(', ').join(' | ');
        const productCategory = products.productInfo?.productCategory;
        const productQuantity = products.productInfo?.productQuantity;
        const productPrice = products.productInfo?.productPrice;
        const productTotalSold = products.productInfo?.totalSold;
         
        return [productID,productName, productCategory, productQuantity, productPrice, productTotalSold].join(',');
      });

      //what this does is it joins the headers and the rows data together
      const csvContent = [fields.join(','), ...csvRows].join('\n'); 
      const csvBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); //blob is the file explorer being opened when saving a file

      const link = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);

      //getting the date today
      const dateToday = dayjs().format('YYYY-MM-DD');

      link.setAttribute('href', url);
      link.setAttribute('download', `${dateToday}_product_inventory.csv`);

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
      doc.text('PRODUCT INVENTORY', pageWidth / 2, subtitleStartY + boxHeight / 2 + 3, { align: 'center' });
  
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
        ['Product ID', 'Product Name', 'Category', 'Product Quantity', 'Price', 'Total Sold']
      ];
  
      const data = products.map(product => {
        const productID = `${product?.productID}`;
        const productName = product.productInfo?.productName.split(', ').join(' | ');
        const productCategory = product.productInfo?.productCategory;
        const productQuantity = product.productInfo?.productQuantity;
        const productPrice = product.productInfo?.productPrice;
        const productTotalSold = product.productInfo?.totalSold;
  
        return [
          productID,
          productName,
          productCategory,
          productQuantity,
          productPrice,
          productTotalSold
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
  
      doc.save(`${dateToday}_product_inventory.pdf`);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <div>
      {isLoading ? (
       <PreLoader />
      ) : (
        <Box m={2} sx={{ mt: 5 }}>
         <Grid container direction="column" spacing={2}>
            <Grid item container justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
                Product Inventory
              </Typography>
              <Grid container spacing={4} sx={{ width: "45%" }}>
              <Grid item xs={6}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  onClick={handleButtonClick}
                  sx={{
                    
                    backgroundColor: 'White',
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
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
                  }}
                  startIcon={<AddIcon />}

                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 16 }, padding: 0.5 }}>Add Product</Typography>
                </Button>
              </Grid>
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
            </Grid>
            </Grid>
            <Grid item>
              <Divider sx={{ borderTopWidth: 2, mb : 3 }}/>
            </Grid>
          </Grid>
          <ProductInventoryTable products={products} fetchProducts={fetchProducts}/>
          <AddProduct open={isDialogOpen} onClose={handleDialogClose} fetchProducts={fetchProducts} zIndex={1000}/>
        </Box>
       )}
    </div>
  )
}

export default ProductInventory 