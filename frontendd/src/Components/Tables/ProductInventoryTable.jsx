import React, { useState } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  Box,
  Rating,
  styled,
  Button,
  Pagination,
  Stack,
  LinearProgress,
  linearProgressClasses,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Grid,
  FormControl,
  Select,
  Tooltip
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import StarIcon from '@mui/icons-material/Star';
import EditProducts from '../Dialogs/EditProducts';
import { Search, Visibility, VisibilityOff,} from '@mui/icons-material';

const ProductInventoryTable = ({ products, fetchProducts }) => {

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductID, setSelectedProductID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [sortAmount, setSortAmount] = useState('');
  const [sortCategory, setSortCategory] = useState('');

  const itemsPerPage = 6;

  const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
      backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: 5,
      background: 'linear-gradient(to right, #009FC2 , #0D0A0B)',
    },
  }));


  const handleProductConfig = (product, productID) => {
    setIsDialogOpen(true);
    setSelectedProduct(product);
    setSelectedProductID(productID);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProduct(null);
    setSelectedProductID(null);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  //handles the ascending and descending order of the product price and quantity
  const sortedProducts = [...products]
    .sort((a, b) => {

      if (sortAmount) {
        return sortAmount === 'asc'
          ? a.productInfo.productPrice - b.productInfo.productPrice
          : b.productInfo.productPrice - a.productInfo.productPrice;
      }

      if (sortConfig.key) {
        if (a.productInfo[sortConfig.key] < b.productInfo[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a.productInfo[sortConfig.key] > b.productInfo[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }

      return 0;
  });
  
  const filteredProducts = sortedProducts.filter((product) => {

    const productNameMatches = product.productInfo.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatches = sortCategory === 'All' || product.productInfo.productCategory === sortCategory || sortCategory === '';
  
    return productNameMatches && categoryMatches;
  });
  
  const sortedAndShuffledProducts = [...filteredProducts].sort((a, b) => {
    if (b.productInfo.totalSold === a.productInfo.totalSold) {
      return Math.random() - 0.5;
    }
    return b.productInfo.totalSold - a.productInfo.totalSold;
  });
  
  const paginatedProducts = sortedAndShuffledProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Box sx={{ padding: '1rem', backgroundColor: '#FFFFFF', boxShadow: '2px 5px 10px rgba(0,0,0,0.4)' }}>
      <Box sx={{ flexGrow: 1, padding: '1rem' }}>
        <Grid container spacing={2} alignItems="center">
          {/* Sort Amount */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <Select
                value={sortAmount}
                onChange={(e) => setSortAmount(e.target.value)}
                displayEmpty
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: 21,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                    Sort by Price
                  </Typography>
                </MenuItem>
                <MenuItem value="asc">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                    Lowest To Highest
                  </Typography>
                </MenuItem>
                <MenuItem value="desc">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                    Highest To Lowest
                  </Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Category */}
          <Grid item xs={12} sm={3} md={2}>
            <FormControl fullWidth>
              <Select
                value={sortCategory}
                onChange={(e) => setSortCategory(e.target.value)}
                displayEmpty
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: 21,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>All Category</Typography>
                </MenuItem>
                <MenuItem value="T-Shirt">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>T-Shirt</Typography>
                </MenuItem>
                <MenuItem value="Shorts">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Shorts</Typography>
                </MenuItem>
                <MenuItem value="Hoodies">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Hoodie</Typography>
                </MenuItem>
                <MenuItem value="Caps">
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>Caps</Typography>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Spacer to push the search field to the right */}
          <Grid item xs />

          {/* Search Field */}
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <TextField
                label="Product Name"
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20, color: 'black' } }}
                sx={{
                  '& input': { fontSize: 18, pt: 3 },
                  backgroundColor: 'white',
                  mt: 1,
                  width: '100%',
                  height: '100%',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    borderBottomColor: 'black',
                    borderRadius: 0,
                    borderBottom: '1.5px solid black',
                  },
                }}
                inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" disabled>
                        <Search />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <TableContainer component={Paper} style={{ maxHeight: '70vh', overflow: 'auto', width: '100%', tableLayout: 'fixed' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              {/* visibility icon */}
              <TableCell>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 600, color: 'black', paddingY: '1vh' }}>
                  PRODUCT ID
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 600, color: 'black', paddingY: '1vh' }}>
                  PRODUCT NAME
                </Typography>
              </TableCell>
              <TableCell>
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'black',
                      paddingY: '1vh',
                  
                    }}
                  >
                    CATEGORY
                  </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{ 
                    fontFamily: 'Kanit', 
                    fontSize: 20, 
                    fontWeight: 'bold', 
                    color: 'black', 
                    paddingY: '1vh', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  QUANTITY
                  <Tooltip  
                    title={
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 'medium' }}>
                      This shows the total quantity of the product, it will turn <span style={{ fontFamily: 'Kanit', fontWeight: 'bold', textDecoration: 'underline' }}>RED</span> if QNT is below the set critical level.
                    </Typography>
                  }>
                    <IconButton
                      sx={{ 
                        marginLeft: 1, 
                        padding: 0  
                      }}
                    >
                      <HelpOutlineIcon sx={{ fontSize: '0.95rem', color: 'black' }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </TableCell>
              <TableCell>
                  <Typography
                    sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}
                  >
                    PRICE
                  </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  sx={{ 
                    fontFamily: 'Kanit', 
                    fontSize: 20, 
                    fontWeight: 'bold', 
                    color: 'black', 
                    paddingY: '1vh', 
                    display: 'flex', 
                    alignItems: 'center' 
                  }}
                >
                  SOLD
                  <Tooltip  
                    title={
                    <Typography sx={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 'medium' }}>
                      This shows the total number of purchases for this product.
                    </Typography>
                  }>
                    <IconButton
                      sx={{ 
                        marginLeft: 1, 
                        padding: 0  
                      }}
                    >
                      <HelpOutlineIcon sx={{ fontSize: '0.95rem', color: 'black' }} />
                    </IconButton>
                  </Tooltip>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 600, color: 'black', paddingY: '1vh' }}>
                  ACTION
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <TableRow
                  key={product.productID}
                  style={{ background: product.productInfo.isCriticalLevel ? '#E74C3C' : 'inherit' }}
                >
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      <Tooltip
                        title={
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>
                            Indicates the visibility of the product. If the visibility is <b>ON</b>, the product is <span style={{ textDecoration: 'underline' }}>listed</span> and can be seen by customers. If the visibility is <b>OFF</b>, then the product is <span style={{ textDecoration: 'underline' }}>unlisted</span> and customers cannot see it.
                          </Typography>
                        }
                        arrow
                      >
                        {product.productInfo.isVisible === true ? (
                          <Visibility />
                        ) : (
                          <VisibilityOff style={{ color: 'red' }} />
                        )}
                      </Tooltip>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      <b>{product?.productID}</b>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={product.productInfo?.productImage}
                        alt={product.productInfo?.productName}
                        style={{ width: 50, height: 50, marginRight: 10 }}
                      />
                      <div>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                          {product.productInfo?.productName}
                        </Typography>
                        <Rating
                          name="product-rating"
                          value={product.productInfo?.productRatings}
                          emptyIcon={<StarBorderIcon style={{ color: '#F1C40F', fontSize: '1.0rem' }} />}
                          icon={<StarIcon style={{ color: 'linear-gradient(to right, #FABC3C , #FACC6B)', fontSize: '1.0rem' }} />}
                          readOnly
                        />
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      <b>{product.productInfo?.productCategory.toUpperCase()}</b>
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      {product.productInfo?.productQuantity}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      ₱{parseInt(product.productInfo?.productPrice).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      <Tooltip
                        title={
                          <Typography sx={{ fontFamily: 'Kanit', fontSize: 14 }}>
                            Total Sold: {product.productInfo?.totalSold}
                          </Typography>
                        }
                        arrow
                      >
                        <div>
                          <BorderLinearProgress
                            variant="determinate"
                            value={product.productInfo?.totalSold}
                            sx={{ width: '100%' }}
                          />
                        </div>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                      <Button
                        type="submit"
                        fullWidth
                        onClick={() => handleProductConfig(product.productInfo, product.productID)}
                        variant="contained"
                        sx={{
                          backgroundColor: 'White',
                          '&:hover': { backgroundColor: '#28b463', color: 'white' },
                          '&:not(:hover)': { backgroundColor: '#239b56', color: 'white' },
                        }}

                      >
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, padding: 0.5 }}>
                          {product.productInfo?.isCriticalLevel ? 'RESTOCK' : 'EDIT'}
                        </Typography>
                      </Button>
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 500, color: 'black' }}>
                    No Products Added yet...
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <Pagination
          count={Math.ceil(filteredProducts.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>
      {selectedProduct && (
        <EditProducts
          open={isDialogOpen}
          onClose={handleDialogClose}
          product={selectedProduct}
          productID={selectedProductID}
          fetchProducts={fetchProducts}
        />
      )}
    </Box>
  );
};

export default ProductInventoryTable;
