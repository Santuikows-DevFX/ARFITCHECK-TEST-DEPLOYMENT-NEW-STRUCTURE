import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';
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
    textAlign: 'center',
  },
  avatar: {
    width: '150px',
    height: '150px',
    margin: 'auto',
    marginBottom: '20px',
  },
  lineSeparator: {
    width: '100%',
    borderBottom: '1px solid #000000',
    marginBottom: '20px',
  },
};

const TempoShippingDetails = () => {
  const [userInfo, setUserInfo] = useState({});
  const [userShipping, setUserShipping] = useState([]);
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [barangay, setBarangay] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [cookie] = useCookies(['?id']);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const userResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      const userShippingResponse = await axiosClient.get(`auth/getMyAddress/${cookie['?id']}`);
      if (userResponse.data && userShippingResponse.data) {
        setUserInfo(userResponse.data);
        setUserShipping(userShippingResponse.data);

        setCountry(userShippingResponse.data.country)
        setAddressLine(userShippingResponse.data.addressLine)
        setCity(userShippingResponse.data.city)
        setBarangay(userShippingResponse.data.barangay)
        setZipCode(userShippingResponse.data.postalCode)
      }

    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateShippingDetails = () => {
    try {
      const shippingDetails = {
        uid: cookie['?id'],
        addressLine: addressLine,
        barangay: barangay,
        city: city,
        postalCode: zipCode,
        country: country
      };
      axiosClient.post('auth/updateShippingDetails', shippingDetails)
      .then(({ data }) => {
        console.log(data.message);
      });
      
    } catch (error) {
      console.log(error);
    }
  };

  const routes = ['/userdashboard', '/myOrders', '/shipping'];
  const menuItems = ['Account Settings', 'My Orders', 'Shipping Details'];

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
          {menuItems.map((text, index) => (
            <Button key={text} component={Link} to={routes[index]} variant="text" style={{ textTransform: 'none' }}>
              {text}
            </Button>
          ))}
        </div>
      </Drawer>
      <main style={styles.content}>
        <div style={styles.toolbar} />
        <Avatar alt="User Image" src={userInfo.profileImage} style={styles.avatar} />
        <Typography variant="h5" gutterBottom>
          {userInfo.firstName} {userInfo.lastName}
        </Typography>
        <div style={styles.lineSeparator}></div>
        <TextField
            disabled = {true}
            fullWidth
            margin="normal"
            label="Country"
            value={country}
            InputProps={{
                style: {
                fontSize: '16px',
                paddingTop: '28px',
                },
            }}
            onChange={(e) => setCountry(e.target.value)}
            />
       <TextField
        fullWidth
        margin="normal"
        label="City/Municipality"
        value={city}
        InputProps={{
            style: {
            fontSize: '16px',
            paddingTop: '28px',
            },
        }}
        onChange={(e) => setCity(e.target.value)}
        />

        <TextField
        fullWidth
        margin="normal"
        label="Barangay"
        value={barangay}
        InputProps={{
            style: {
            fontSize: '16px',
            paddingTop: '28px',
            },
        }}
        onChange={(e) => setBarangay(e.target.value)}
        />

        <TextField
        fullWidth
        margin="normal"
        label="Address Line"
        value={addressLine}
        InputProps={{
            style: {
            fontSize: '16px',
            paddingTop: '28px',
            },
        }}
        onChange={(e) => setAddressLine(e.target.value)}
        />

        <TextField
        fullWidth
        margin="normal"
        label="Zip"
        value={zipCode}
        InputProps={{
            style: {
            fontSize: '16px',
            paddingTop: '28px',
            },
        }}
        onChange={(e) => setZipCode(e.target.value)}
        />

        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }} onClick={handleUpdateShippingDetails}>
          Update Profile
        </Button>
      </main>
    </div>
  );
};

export default TempoShippingDetails;
