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

    // useEffect(() => {
    //   fetchProducts();
    // }, []);

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

        const productID = products?.productID;
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
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: '#196F3D',
                    color: 'white',
                    '&:not(:hover)': { backgroundColor: '#317000', color: 'white' },
                    '&:hover': { backgroundColor: '#239B56' },
                    fontSize: { xs: 10, md: 16 },  
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    fontFamily: 'Kanit',
                    fontWeight: 'bold',
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