import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Grid, Avatar, IconButton, Button, CircularProgress, Backdrop  } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone'; 
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; 
import PreLoader from '../../Components/PreLoader';
import AddStaff from '../../Components/Dialogs/AddStaff';
import DeleteIcon from '@mui/icons-material/Delete'; 
import AddIcon from '@mui/icons-material/Add';
import axiosClient from '../../axios-client';
import Swal from 'sweetalert2';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import dayjs from 'dayjs';
import { useSnackbar } from "notistack";
import BadgeIcon from '@mui/icons-material/Badge';

function Staffs() {
  const [isLoading, setIsLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [functionLoading, setFunctionLoading] = useState(false);

  const { enqueueSnackbar  } = useSnackbar();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchAdminInfo();
  }, []);

  useEffect(() => {
    if (functionLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
}, [functionLoading]);


  const fetchAdminInfo = async () => {
    try {
      const adminInfoResponse = await axiosClient.get('/auth/fetchAdminInfo');
      setAdminInfo(adminInfoResponse.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteAdmin = (adminID, adminFirstName) => {
    
    try {

      Swal.fire({
        title: `Are you sure you want to remove ${adminFirstName}?`,
        text: "You won't be able to revert this once deleted.",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "I know",
      }).then((result) => {
        if (result.isConfirmed) {
          setFunctionLoading(true)
          axiosClient.post(`auth/deleteAdmin/${adminID}`).then(({ data }) => {
            if (data.message === 'Admin Removed!') {
              enqueueSnackbar(`${data.message}`, { 
                variant: 'success',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                },
                autoHideDuration: 2000,
                style: {
                  fontFamily: 'Kanit',
                  fontSize: '16px'
                },
                
              });
              setFunctionLoading(false)
              fetchAdminInfo();
            } else {
              enqueueSnackbar(`${data.message}`, { 
                variant: 'error',
                anchorOrigin: {
                  vertical: 'top',
                  horizontal: 'right'
                },
                autoHideDuration: 2000,
                style: {
                  fontFamily: 'Kanit',
                  fontSize: '16px'
                },
                
              });
              setFunctionLoading(false)
            }
          });
        }
      });
      
    } catch (error) {
      console.log(error);
      setFunctionLoading(false)
      
    }
  };

  return (
    <div>
      {functionLoading && (
        <Backdrop open={true} style={{ zIndex: 1000 + 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </div>
        </Backdrop>
      )}
      {isLoading ? (
        <PreLoader />
      ) : (
        <Box m={2} pb={"60vh"} sx={{ mt: 5 }}>
          <Grid container direction="column" spacing={2}>
            <Grid 
              item 
              container 
              justifyContent={{ xs: 'center', md: 'space-between' }} 
              alignItems="center" 
              direction={{ xs: 'column', md: 'row' }} 
              sx={{ paddingY: '1vh' }}
            >
              <Typography
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs: 30, sm: 40, md: 50 },
                  fontWeight: 'bold',
                  color: 'black',
                  textAlign: { xs: 'center', md: 'left' },
                  width: { xs: '100%', md: 'auto' },
                }}
              >
                MY TEAM
              </Typography>
              <Box 
                sx={{ 
                  width: { xs: '100%', sm: '50%', md: "30%" }, 
                  marginTop: { xs: 2, md: 0 },
                  display: 'flex', 
                  justifyContent: { xs: 'center', md: 'flex-end' },
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleButtonClick}
                  sx={{
                    backgroundColor: 'White',
                    padding: { xs: '0.3rem 0.6rem', md: '0.5rem 1rem' },  
                    "&:hover": {
                      backgroundColor: "#414a4c",
                      color: "white",
                    },
                    "&:not(:hover)": {
                      backgroundColor: "#3d4242",
                      color: "white",
                    },
                    background: "linear-gradient(to right, #414141, #000000)",
                  }}
                  startIcon={<AddIcon />}
                >
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 20 }, padding: 0.5 }}>Add Admin</Typography>
                </Button>
              </Box>
            </Grid>
            <Divider sx={{ borderTopWidth: 2, mb: 3, color: 'black' }} />
          </Grid>

          <Grid container spacing={3}>
            {adminInfo.length > 0 ? (
              adminInfo.map((admin, index) => (
                <Grid item xs={12} sm={6} md={6} lg={4} key={admin.adminID}>
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <Box
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 5,
                        padding: { xs: '3vh', sm: '5vh' },
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                        minHeight: { xs: 'auto', sm: '350px' }, 
                        textAlign: 'center', 
                      }}
                    >
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12}>
                          <Avatar
                            sx={{
                              width: { xs: 90, sm: 80, md: 160 },
                              height: { xs: 90, sm: 80, md: 160 },
                              margin: '0 auto', 
                            }}
                            src={admin.adminInfo.profileImage}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Typography
                            sx={{
                              fontFamily: 'Kanit',
                              fontSize: { xs: 18, sm: 20, md: 25 },
                              fontWeight: 'bold',
                              color: 'black',
                              wordBreak: 'break-word', 
                              overflowWrap: 'break-word',
                            }}
                          >
                            {admin.adminInfo.firstName} {admin.adminInfo.lastName}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 14, sm: 15, md: 18 }, color: 'gray', marginY: 1,  fontFamily: 'Kanit' }}>
                            <SupervisorAccountIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: 1, color: 'black' }} /> Admin
                          </Typography>
                          <Typography 
                            sx={{ 
                              fontSize: { xs: 14, sm: 15, md: 18 }, 
                              color: 'gray', 
                              marginY: 1,  
                              fontFamily: 'Kanit' 
                            }}
                          >
                            <BadgeIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: 1, color: 'black' }} /> 
                            {admin?.adminID}
                          </Typography>

                          <Typography sx={{ fontSize: { xs: 14, sm: 15, md: 18 }, color: 'gray', wordBreak: 'break-word', fontFamily: 'Kanit' }}>
                            <EmailIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: 1, color: 'black', }} /> {admin.adminInfo.email}
                          </Typography>
                          <Typography sx={{ fontSize: { xs: 14, sm: 15, md: 18 }, color: 'gray', wordBreak: 'break-word', fontFamily: 'Kanit' }}>
                            <PhoneIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: 1, color: 'black' }} /> 
                            {admin.adminInfo.mobileNumber}
                          </Typography>

                          <Typography sx={{ fontSize: { xs: 14, sm: 15, md: 18 }, color: 'gray', wordBreak: 'break-word', fontFamily: 'Kanit' }}>
                            <CalendarMonthIcon sx={{ fontSize: { xs: 16, sm: 18, md: 20 }, mr: 1, color: 'black' }} /> 
                            Added {dayjs(admin.adminInfo.addedDate).format('MMMM D, YYYY')}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                    <IconButton
                      style={{ position: 'absolute', top: 0, right: 0, color: 'black' }}
                      aria-label="delete"
                      onClick={() => handleDeleteAdmin(admin.adminID, admin.adminInfo.firstName)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))
            ) : (
              <Typography
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs: 14, sm: 16, md: 20 },
                  fontWeight: 'medium',
                  color: 'gray',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                No Admin Added Yet...
              </Typography>
            )}
          </Grid>
          <AddStaff open={isDialogOpen} onClose={handleDialogClose} fetchAdminInfo={fetchAdminInfo} zIndex={1000} />
        </Box>
      )}
    </div>
  );
}

export default Staffs;
