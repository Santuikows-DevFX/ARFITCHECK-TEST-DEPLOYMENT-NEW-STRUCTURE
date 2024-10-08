import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
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

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

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
    display: 'flex',
    flexDirection: 'column',
   
  },
  addButton: {
    position: 'absolute',
    top: '10px',
    left: '250px',
  },
  tableContainer: {
    width: '100%',
    marginTop: '20px',
  },
  iconButton: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  button: {
    width: '150px',
    marginBottom: '5px',
    fontSize: '0.6rem',
  },
};

const TempoInventory = () => {

  const [userInfo, setUserInfo] = useState([]);
  const [cookie] = useCookies(['?id']);
  const [openModal, setOpenModal] = useState(false);
  const [productForm, setProductForm] = useState({
    productName: '',
    price: '',
    criticalLevel: '',
    category: '',
    description: '',
    image: null,
  });
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchUserInfo();
    fetchProducts();
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

  const fetchProducts = async () => {
    try {
      // const productsResponse = await axiosClient.get('products');
      // if (productsResponse.data) {
      //   setProducts(productsResponse.data);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setProductForm({
      productName: '',
      price: '',
      criticalLevel: '',
      category: '',
      description: '',
      image: null,
    });
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const imageFile = e.target.files[0];
    setProductForm((prev) => ({
      ...prev,
      image: imageFile,
    }));
  };

  const handleSubmit = () => {
    console.log(productForm);
    handleCloseModal();
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
      <Button onClick={handleOpenModal} variant="contained" color="primary" style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <AddIcon /> Add Product
    </Button>
      <h1>
          Product Inventory
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
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            <TableRow>
                  <TableCell>-Nq23suixciasoLs</TableCell>
                  <TableCell>
                  <img src="../src/assets/defaultProfile/poop.jpg" alt="Product Image" style={{ width: '50px', height: '50px', marginRight: '10px' }} />
                    Tae
                  </TableCell>
                  <TableCell>69</TableCell>
                  <TableCell>169</TableCell>
                  <TableCell>
                  <Button variant="contained" style={{ backgroundColor: '#4CAF50', color: 'white',  width: '100%'}}>
                    Edit
                  </Button>
                  </TableCell>
            </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </main>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Product to Inventory</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="productName"
            label="Product Name"
            type="text"
            fullWidth
            name="productName"
            value={productForm.productName}
            onChange={handleProductFormChange}
          />
          <TextField
            margin="dense"
            id="price"
            label="Price (₱)"
            type="number"
            fullWidth
            name="price"
            value={productForm.price}
            onChange={handleProductFormChange}
          />
          <TextField
            margin="dense"
            id="criticalLevel"
            label="Critical Level Quantity"
            type="number"
            fullWidth
            name="criticalLevel"
            value={productForm.criticalLevel}
            onChange={handleProductFormChange}
          />
          <div style={{ marginBottom: '20px' }}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Category</FormLabel>
              <RadioGroup
                aria-label="category"
                name="category"
                value={productForm.category}
                onChange={handleProductFormChange}
                style={{ flexDirection: 'row' }} // Display radio buttons horizontally
              >
                <FormControlLabel value="t-shirts" control={<Radio />} label="T-Shirts" />
                <FormControlLabel value="caps" control={<Radio />} label="Caps" />
                <FormControlLabel value="hoodies" control={<Radio />} label="Hoodies" />
                <FormControlLabel value="shorts" control={<Radio />} label="Shorts" />
              </RadioGroup>
            </FormControl>
          </div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Size</TableCell>
                  <TableCell>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {['Small', 'Medium', 'Large'].map((size) => (
                  <TableRow key={size}>
                    <TableCell>{size}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        fullWidth
                        inputProps={{ min: 0 }} // Ensure positive integers
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TextField
            margin="dense"
            id="description"
            label="Description"
            multiline
            rows={4}
            fullWidth
            name="description"
            value={productForm.description}
            onChange={handleProductFormChange}
          />
          <input
            accept="image/*"
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="image-upload">
            <IconButton color="primary" aria-label="upload picture" component="span">
              <PhotoCamera />
            </IconButton>
            Upload Image
          </label>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TempoInventory;



// {products.map((product) => (
//   <TableRow key={product.id}>
//     <TableCell>1</TableCell>
//     <TableCell>
//       <IconButton size="small">
//         <PersonIcon />
//       </IconButton>
//       {/* {product.name} */}
//       Tae
//     </TableCell>
//     <TableCell>69</TableCell>
//     <TableCell>169</TableCell>
//     <TableCell>
//       <IconButton style={styles.iconButton}>
//         <AddIcon />
//       </IconButton>
//     </TableCell>
//   </TableRow>
// ))}
