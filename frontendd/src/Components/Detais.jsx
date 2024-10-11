import React, { useEffect, useState } from 'react';
import { Avatar, Box, Typography, Grid, Icon, Skeleton } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCookies } from 'react-cookie';
import axiosClient from '../axios-client';

import defaultProfileImage from '../../public/assets/defaultProfile/pesonicon.png'

const Details = ({ avatarUrl, name, email }) => {

  const [cookie] = useCookies(['?id']);
  const [userInfo, setUserInfo] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo()
  }, [cookie])

  const fetchUserInfo = async () => {
    try {
      const userInfoResponse = await axiosClient.get(`auth/getUser/${cookie['?id']}`);
      setUserInfo(userInfoResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Box
      sx={{
        background: 'linear-gradient(to left, #D7E1EC, #FFFFFF)',
        borderRadius: 2,
        boxShadow: '0px 10px 5px 0px rgba(0,0,0,0.2)',
        width: "100%",
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', sm: 'left', md: 'left' }, 
        textAlign: { xs: 'center', sm: 'left', md: 'left' },
      }}
    >
      <Grid container spacing={2} justifyContent="center">
        <Grid item xs={12} md={2}>
          {isLoading ? (
            <Skeleton variant="circular" width={150} height={150} />
          ) : (
            <Avatar
              alt="Avatar"
              src={defaultProfileImage}
              sx={{
                width: { xs: 90, sm: 80, md: 150 },
                height: { xs: 90, sm: 80, md: 150 },
                margin: 'auto'
              }}
            />
          )}
        </Grid>
        <Grid item xs={12} md={10}>
          {isLoading ? (
            <>
              <Skeleton variant="text" sx={{ fontSize: { xs: 20, sm: 18, md: 30 }, marginBottom: 1 }} />
              <Skeleton variant="text" sx={{ fontSize: { xs: 14, sm: 16, md: 20 }, marginBottom: 1 }} />
              <Skeleton variant="text" sx={{ fontSize: { xs: 12, sm: 16, md: 18 }, marginBottom: 1 }} />
            </>
          ) : (
            <>
              <Typography 
                sx={{ 
                  fontFamily: 'Kanit', 
                  fontSize: { xs: 20, sm: 18, md: 30 }, 
                  fontWeight: 'bold', 
                  color: 'black' 
                }}
              >
                {userInfo.firstName} {userInfo.lastName}
              </Typography>
              <Grid container alignItems="center" spacing={1} sx={{ marginTop: 1 }}>
                <Grid item>
                  <Icon component={EmailIcon} sx={{ fontSize: { xs: 12, sm: 16, md: 18 }, color: 'black' }} />
                </Grid>
                <Grid item>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Inter', 
                      fontSize: { xs: 14, sm: 16, md: 20 }, 
                      fontWeight: 'medium', 
                      color: 'black', 
                      display: 'inline-block', 
                    }}
                  >
                    {userInfo.email}
                  </Typography>
                  {userInfo.email && <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 16, md: 18 }, color: 'green', marginLeft: 1 }} />}
                </Grid>
              </Grid>
              <Grid container alignItems="center" spacing={1} sx={{ marginTop: 1 }}>
                <Grid item>
                  <Icon component={PhoneIcon} sx={{ fontSize: { xs: 12, sm: 16, md: 18 }, color: 'black' }} />
                </Grid>
                <Grid item>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Inter', 
                      fontSize: { xs: 12, sm: 16, md: 18 }, 
                      fontWeight: 'medium', 
                      color: 'black', 
                      display: 'inline-block', 
                    }}
                  >
                    {userInfo.mobileNumber}
                  </Typography>
                  {userInfo.mobileNumber && <CheckCircleIcon sx={{ fontSize: { xs: 12, sm: 16, md: 18 }, color: 'green', marginLeft: 1 }} />}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Details;
