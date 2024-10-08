import React, { useEffect, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';

import {useCookies} from 'react-cookie';
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

const TempoUserDashboard = () => {


  const [userInfo, setUserInfo] = useState([])
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [cookie] = useCookies(['?id'])

  useEffect(() => { 
    fetchUserInfo()
  }, [])


  const fetchUserInfo = async () =>  {
    try {
        const userResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`)
        if(userResponse.data) {

            setUserInfo(userResponse.data)

            setMobileNumber(userResponse.data.mobileNumber)
            setEmail(userResponse.data.email)
            setFirstName(userResponse.data.firstName)
            setLastName(userResponse.data.lastName)

        }
    }catch(error){ 
        console.log(error);
    }
  }

  const handleUpdateProfile = (e) => { 
    try { 

        const uid = {
            uid: cookie['?id'],
            mobileNumber: mobileNumber
        }

        axiosClient.post('auth/updateProfile', uid)
        .then(({data}) => {
            console.log(data.message);
        })

    }catch(error){
        console.log(error);
    }
  }

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
            <Button 
              key={text} 
              component={Link} 
              to={routes[index]} 
              variant="text"
              style={{textTransform: 'none'}}
            >
              {text}
            </Button>
          ))}
        </div>
      </Drawer>
      <main style={styles.content}>
        <div style={styles.toolbar} />
        <Avatar alt="User Image" src={userInfo.profileImage} style={styles.avatar} />
        <Typography variant="h5" gutterBottom>
          {userInfo.firstName} {' '} {userInfo.lastName}
        </Typography>
        <div style={styles.lineSeparator}></div>

        <TextField
            disabled={true}
            fullWidth
            margin="normal"
            label="First Name"
            value = {firstName}
            InputProps={{
                style: {
                fontSize: '16px',
                paddingTop: '28px',
                },
            }}
            onChange={(e) => setFirstName(e.target.value)}
            />
        <TextField
            disabled={true}
            fullWidth
            margin="normal"
            label="Last Name"
            value={lastName}
            InputProps={{
                style: {
                fontSize: '16px',
                paddingTop: '28px',
                },
            }}
            onChange={(e) => setLastName(e.target.value)}
            />
        <TextField
            fullWidth
            margin="normal"
            label="Email"
            type='email'
            value={email}
            InputProps={{
                style: {
                fontSize: '16px',
                paddingTop: '28px',
                },
            }}
            onChange={(e) => setEmail(e.target.value)}
            />
        <TextField label="Mobile Number" type='number' fullWidth margin="normal" name='mobileNumber' value={mobileNumber ? mobileNumber : ''}
          onChange={(e) => setMobileNumber(e.target.value)} />
        <Button variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }} onClick={() => {
            handleUpdateProfile()
        }}>
          Update Profile
        </Button>
      </main>
    </div>
  );
};

export default TempoUserDashboard;
