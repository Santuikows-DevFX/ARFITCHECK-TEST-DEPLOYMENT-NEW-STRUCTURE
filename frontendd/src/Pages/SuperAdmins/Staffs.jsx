import React, { useEffect } from 'react';
import { useState } from 'react';
import { Box, Typography, Divider, Grid, Avatar, IconButton, Button } from '@mui/material';
import { FilledButton } from '../../Components/UI/Buttons';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone'; 
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount'; 
import PreLoader from '../../Components/PreLoader';
import AddStaff from '../../Components/Dialogs/AddStaff';
import DeleteIcon from '@mui/icons-material/Delete'; 
import KeyIcon from '@mui/icons-material/Key';
import axiosClient from '../../axios-client';
import AddIcon from '@mui/icons-material/Add';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

import Swal from 'sweetalert2'

function Staffs() {
    const [isLoading, setIsLoading] = React.useState(true);
    const [adminInfo, setAdminInfo] = useState([])
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEncrypted, setIsEncrypted] = useState(true)

    React.useEffect(() => {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
      fetchAdminInfo();
    }, [])

    const fetchAdminInfo = async () => {
      try {

        const adminInfoResponse = await axiosClient.get('/auth/fetchAdminInfo')
        setAdminInfo(adminInfoResponse.data)
        
      } catch (error) {
        console.log(error);
      }
    }

    const handleSetEncryption = () => {
      if(isEncrypted === true){
        setIsEncrypted(false)

      }else {
        setIsEncrypted(true)

      }
    }

    const handleButtonClick = () => {
      setIsDialogOpen(true);
    };
  
    const handleDialogClose = () => {
      setIsDialogOpen(false);
    };

    const handleDeleteAdmin  = (adminID, adminFirstName) => {

      try {

        Swal.fire({
          title: `Are you sure you want to remove ${adminFirstName}?`,
          text: "You won't be able to revert this once deleted. ",
          icon: "question",
          showCancelButton: true,
          cancelButtonText: 'Cancel',
          confirmButtonColor: '#414a4c',
          confirmButtonText: "I know",
          customClass: {
            container: 'sweet-alert-container',
          },
          didOpen: () => {
            document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
          }

        }).then((result) => {
          if (result.isConfirmed) {
            axiosClient.post(`auth/deleteAdmin/${adminID}`)
            .then(({data}) => {

              if(data.message === 'Admin Removed!') {

                toast.success(`${data.message}`, {
                  position: "top-right",
                  autoClose: 2300,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  style: { fontFamily: 'Kanit', fontSize: '16px' }
                });

                fetchAdminInfo()

              }else {

                toast.error(`${data.message}`, {
                  position: "top-right",
                  autoClose: 2300,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "colored",
                  transition: Bounce,
                  style: { fontFamily: 'Kanit', fontSize: '16px' }
                });
              }
            }) 
          }
        });
        

      }catch(error) {
        console.log(error);
      }
    }

  return (
    <div>
         {isLoading ? (
        <PreLoader />
      ) : (
        <div>
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
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 18, md: 24.5 }, padding: 0.5 }}>Add Admin</Typography>
            </Button>
          </Box>
        </Grid>
              <Grid item>
                <Divider sx={{ borderTopWidth: 2, mb: 3, color: 'black' }} />
              </Grid>
            </Grid>
            <Box m={2}>
              <Grid container>
                {adminInfo.length > 0 ? (
                  adminInfo.map((admin, index) => (
                    <Grid item xs={12} sm={12} md={12} lg={12} xl={5} key={admin.adminID}>
                      <Box sx={{ position: 'relative', width: '100%' }}>
                        <Box
                          sx={{
                            margin: 'auto',
                            backgroundColor: 'white',
                            borderRadius: 5,
                            paddingY: { xs: '3vh', sm: '5vh' },
                            paddingX: { xs: '2vh', sm: '5vh' },
                            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
                          }}
                        >
                          <Grid container alignItems="center">
                            <Grid
                              item
                              xs={12} sm = {12}md={6}
                            
                            >
                          <Avatar
                              sx={{
                                width: { xs: 90, sm: 80, md: 180 },
                                height: { xs: 90, sm: 80, md: 180 },
                              }}
                            src={admin.adminInfo.profileImage}
                          />
          
                            </Grid>
                            <Grid
                              item
                              xs={12}
                              sm={12}
                              md = {6}
                              sx={{ textAlign: { xs: 'center', sm: 'left' } }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: 'Kanit',
                                  fontSize: { xs: 20, sm: 15, md: 30 },
                                  fontWeight: 'bold',
                                  color: 'black',
                                }}
                              >
                                {admin.adminInfo.firstName} {admin.adminInfo.lastName}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: 'Inter',
                                  fontSize: { xs: 14, sm: 15, md: 18 },
                                  fontWeight: 'medium',
                                  color: 'gray',
                                }}
                              >
                                <SupervisorAccountIcon
                                  sx={{
                                    fontSize: { xs: 16, sm: 15, md: 20 },
                                    marginRight: '5px',
                                    color: 'black',
                                  }}
                                />{' '}
                                Admin
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: 'Inter',
                                  fontSize: { xs: 14, sm: 15, md: 18 },
                                  fontWeight: 'medium',
                                  color: 'gray',
                                }}
                              >
                                <KeyIcon
                                  sx={{
                                    fontSize: { xs: 16, sm: 18, md: 20 },
                                    marginRight: '5px',
                                    color: 'black',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => {
                                    handleSetEncryption();
                                  }}
                                />
                                {isEncrypted === true
                                  ? admin.adminPassEncrypted
                                  : admin.adminPass}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: 'Inter',
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  fontWeight: 'medium',
                                  color: 'gray',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <EmailIcon
                                  sx={{
                                    fontSize: { xs: 16, sm: 15, md: 20 },
                                    marginRight: '5px',
                                    color: 'black',
                                  }}
                                />{' '}
                                {admin.adminInfo.email}
                              </Typography>
                              <Typography
                                sx={{
                                  fontFamily: 'Inter',
                                  fontSize: { xs: 14, sm: 16, md: 18 },
                                  fontWeight: 'medium',
                                  color: 'gray',
                                }}
                              >
                                <PhoneIcon
                                  sx={{
                                    fontSize: { xs: 16, sm: 18, md: 20 },
                                    marginRight: '5px',
                                    color: 'black',
                                  }}
                                />{' '}
                                {admin.adminInfo.mobileNumber}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Box>
                        <IconButton
                          style={{ position: 'absolute', top: 0, right: 0, color: 'black' }}
                          aria-label="delete"
                          onClick={() =>
                            handleDeleteAdmin(admin.adminID, admin.adminInfo.firstName)
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))
                ) : (
                  <Typography
                    sx={{
                      fontFamily: 'Inter',
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
            </Box>
            <AddStaff
              open={isDialogOpen}
              onClose={handleDialogClose}
              fetchAdminInfo={fetchAdminInfo}
              zIndex={1000}
            />
          </Box>
        </div>
     )}
    </div>
  );
}

export default Staffs;