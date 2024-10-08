import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AddIcon from '@mui/icons-material/Add';
import { Typography, Button ,TextField, Grid,FormControlLabel , FormHelperText, InputAdornment, IconButton, CircularProgress, Alert, Collapse, Box } from '@mui/material';

import { useCookies } from 'react-cookie';
import axiosClient from '../../../axios-client';
import { Link } from 'react-router-dom';

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
    right: '10px',
  },
  addStaffContainer: {
    width: 'calc(100% - 40px)',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#F8F9F9'
  },
  staffCard: {
    width: 'calc(25% - 20px)',
    backgroundColor: '#EAECEE',
    borderRadius: '10px',
    padding: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '10px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '10px',
    color: '#757575', 
    fontSize: '80px', 
  },
  textContainer: {
    flexGrow: 1,
    textAlign: 'left',
  },
};

const TempoStaff = () => {

  const [openModal, setOpenModal] = useState(false);
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhoneNumber] = useState('')

  const[message, setMessage] = useState([])
  const [show, setShow] = useState(false)

  //admin info
  const [adminInformation, setAdminInformation] = useState([])

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    fetchAdminInfo()
  }, [])


  const fetchAdminInfo = async () => {
    try {

      const adminInfo = await axiosClient.get('/auth/fetchAdminInfo')
      if(adminInfo.data) {
        setAdminInformation(adminInfo.data)

      }

    }catch(error){
      console.log(error);
    }
  }
  
  const handleSubmit = async () => {

    const adminData = { 
       adminFirstName: firstName,
       adminLastName: lastName,
       adminEmail: email,
       adminPass: password,
       adminPhone: phone,
    }
    try {
      await axiosClient.post('auth/addAdmin', adminData)
      .then(({data}) => {

        if(data.message) { 
          setMessage(data.message)
          setShow(true)

          fetchAdminInfo()
        }

      })
    } catch (error) {
      console.log(error);
    }
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
        <h1>Team</h1>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Collapse in={show}>
            <Alert
              severity='success'
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setShow(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              sx={{ mb: 2, width: '100%', maxWidth: '600px' }}
            >
              {message}
            </Alert>
          </Collapse>
        </div>
        <Button onClick={handleOpenModal} variant="contained" color="primary" style={{ ...styles.addButton, right: '20px', left: 'auto' }}>
          <AddIcon /> Add Staff
        </Button>
        <Divider style={{ width: '100%', marginBottom: '20px' }} />
        <div style={styles.addStaffContainer}>
          {adminInformation.length > 0 ? (
            adminInformation.map((adminData) => (
              <Card style={styles.staffCard}>
                <img
                  src={adminData.profileImage}
                  alt="Avatar"
                  style={{ width: 100, height: 100, marginRight: 10 }} 
                />
                <div style={styles.textContainer}>
                  <Typography variant="h6">{adminData.firstName} {adminData.lastName}</Typography>
                  <Typography variant="body2" style={{ fontSize: '0.7rem' }}><b>Email:</b> {adminData.email}</Typography>
                  <Typography variant="body2" style={{ fontSize: '0.7rem' }}><b>Phone:</b> {adminData.mobileNumber}</Typography>
                </div>
                <IconButton style={{ position: 'absolute', top: '5px', right: '5px' }}>
                  <RemoveIcon />
                </IconButton>
              </Card>
            ))
          ) : (
            <h1 className='text-center'>No Staff added yet.</h1>
          )}
        </div>
      </main>
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Staff</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="firstName"
            label="First Name"
            type="text"
            fullWidth
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="lastName"
            label="Last Name"
            type="text"
            fullWidth
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            margin="dense"
            id="email"
            label="Email"
            type="email"
            fullWidth
            name="email"
            value= {email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="email"
            label="Password"
            type="password"
            fullWidth
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            id="phone"
            label="Mobile Number"
            type="text"
            fullWidth
            name="phone"
            value={phone}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
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

export default TempoStaff;
