import * as React from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Drawer,
  List,
  Popover,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  Collapse
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  

} from '@mui/icons-material';

import { HoverableListItem, SubHoverableListItem } from '../../Components/UI/Buttons';
import PreLoader from '../../Components/PreLoader';
import ProductInventory from '../SuperAdmins/ProductInventory';
import Orders from '../SuperAdmins/Orders';
import TransactionHistory from '../SuperAdmins/TransactionHistory';

import Swal from 'sweetalert2'
import { useCookies } from 'react-cookie';
import CustomRequest from '../SuperAdmins/CustomRequest';
import axiosClient from '../../axios-client';
import CancelOrderRequest from '../SuperAdmins/CancelOrderRequest';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../ContextAPI/ContextAPI';

const Admin = () => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchroEl] = React.useState(null)

  const [drawerOpen, setDrawerOpen] = React.useState(!isMobile);
  const [selectedItem, setSelectedItem] = React.useState('Product Inventory');
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [ordersOpen, setOrdersOpen] = React.useState(false)
  const [inventoryOpen, setInventoryOpen] = React.useState(false);
  
  const [cookie, removeCookie, remove] = useCookies(['?tokenID', '?id'])
  const { setToken, setUserID, setRole } = useStateContext()

  //notifacation fetching
  const [notificationData, setNotificationData] = React.useState([]);
  const [notifCount, setNotifCount] = React.useState(0)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  //notification hook
  React.useEffect(() => {
    fetchNotificationData();
    fetchAndHandleNotifyOutForDeliveryOrders();
  }, [])

  const fetchAndHandleNotifyOutForDeliveryOrders = async () => {
    
    try {

      const orderOutForDeliveryResponse = await axiosClient.get('/order/fetchOutForDeliveryOrders');
      if(orderOutForDeliveryResponse.data) {

        //VARIABLES
        const currDate = new Date();
        const currTime = currDate.getTime();

        orderOutForDeliveryResponse.data.map((orders) => {
          
          //GET THE ORDER DELIVERY DATE AND UPDATE TIME STAMP WHERE UPDATE STIME STAMP WILL BE THE REFERENCE IF THE HOURS PASSED
          const orderDeliveryDate = new Date(orders.orderInfo?.orderDateDelivery);
          const updateTimeStamp = new Date(`${orderDeliveryDate?.toDateString()} ${orders.orderInfo?.updateTimeStamp}`).getTime()
          const estHoursOfDelivery = orders.orderInfo?.estimatedTimeOfDelivery * 60 * 60 * 1000

          //CHECK IF THE CURRENT DATE AND THE ORDER DELIVERY DATE IS THE SAME, THIS WILL SERVE AS AN AUTOMATION THAT WILL NOTIFY THE USER IMMEDIATELY.
          if(orderDeliveryDate.toDateString() !== currDate.toDateString()) {
            notifyUsersIfDelivered();
          }else {
            //IF NOT, THEN CHECK IF THE CURR TIME PASSED THE EST HOURS.
            const timePassedSinceUpdate = currTime - updateTimeStamp;

            //CHECK IF THE TIME PASSED IS GREATER THAN THE EST HOURS OF DELIVERY, MEANING THE ORDER IS DELIVERED
            if(timePassedSinceUpdate > estHoursOfDelivery) {
              //NOTIFY USER HERE
              notifyUsersIfDelivered();
              
            }

          }

        });
        
      }

    }catch(error) {
      console.log(error);
    }
  }

  const fetchNotificationData = async () => {
    try {
      const notificationResponse = await axiosClient.get(`/auth/fetchAdminNotifications/${cookie['?id']}`);
      if (notificationResponse.data) {
        const sortedData = notificationResponse.data.sort((a, b) => {
          const dateA = new Date(`${a.notificationDate} ${a.notificationTime}`);
          const dateB = new Date(`${b.notificationDate} ${b.notificationTime}`);
          return dateB - dateA; 
        });
        
        setNotificationData(sortedData)
        setNotifCount(notificationResponse.data.length);

      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleListItemClick = (item) => {
    setSelectedItem(item);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const navigator = useNavigate();
  const handleLogout = () => {

    setAnchorEl(null)
    handleMobileMenuClose();

    Swal.fire({
        title: "Are you sure you want to logout?",
        text: "",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Yes",
        customClass: {
          container: 'sweet-alert-container',
        },
        didOpen: () => {
          document.querySelector('.sweet-alert-container').parentElement.style.zIndex = 9999;
        }
      }).then((result) => {
        if (result.isConfirmed) {

          setToken(null)
          setRole(null)
          setUserID(null)

          navigator('/login')
        }
      });
  }

  //notification panel
  const handleNotificationOpen = (event) => {
    setNotificationAnchroEl(event.currentTarget)
  }

  const handleNotificationClose = (event) => {
    setNotificationAnchroEl(null)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await axiosClient.patch(`/auth/updateAllAdminNotification/${cookie['?id']}`)
      setNotifCount(0)

    } catch (error) { 
      console.log(error);
    }
  };

  const handleDeleteAllNotifications = async () => {
    try{

      await axiosClient.delete(`/auth/deleteAllAdminNotification/${cookie['?id']}`)
      fetchNotificationData();
      
    }catch(error) {
      console.log(error);
    }
  };

  //notification variables
  const openNotication = Boolean(notificationAnchorEl);
  const notificationID = open ? 'notification-popover' : undefined;

  const drawerContent = (
    <div style={{ width: isMobile ? '60vw' : '15vw', backgroundColor: '#353535', position: isMobile ? 'fixed' : 'static', height: '100%', overflowY: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ fontSize: 30, fontWeight: 'bold', fontFamily: 'Kanit', letterSpacing: '0.1rem', marginLeft: '5px', color: 'white', marginTop: '10px' }}>
        ADMIN
      </Typography>
      <Divider sx={{ backgroundColor: '#FFFFFF' }} />
      <Typography variant="body2" sx={{ color: '#FFF', fontSize: 13, marginLeft: '5px', letterSpacing: '0.2rem', fontFamily: 'Kanit', marginTop: '20px' }}>
        DASHBOARD
      </Typography>
  
      <List sx={{ color: 'white' }}>
        <ListItem button onClick={() => setInventoryOpen(!inventoryOpen)}>
              <ListItemIcon>
                <img src="../public/assets/inventory.png" alt="Inventory" style={{ width: '32px', height: '32px' }} />
              </ListItemIcon>
              <ListItemText primary="Products" />
              {inventoryOpen ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={inventoryOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <SubHoverableListItem
                  label="Inventory"
                  icon={<img src="../public/assets/prdinv.png" alt="Inventory" style={{ width: '25px', height: '25px' }} />}
                  isSelected={selectedItem === 'Inventory'}
                  onClick={() => handleListItemClick('Product Inventory')}
                  sx={{ pl: 4 }}
                />
                <SubHoverableListItem
                  label="Size Table"
                  icon={<img src="../public/assets/size.png" alt="Size Table" style={{ width: '26px', height: '26px' }} />}
                  isSelected={selectedItem === 'Size Table'}
                  onClick={() => handleListItemClick('Size Table')}
                  sx={{ pl: 4 }}
                />
              </List>
          </Collapse>
        <ListItem button onClick={() => setOrdersOpen(!ordersOpen)}>
          <ListItemIcon>
            <img src="../public/assets/logistics.png" alt="Orders" style={{ width: '35px', height: '35px' }} />
          </ListItemIcon>
          <ListItemText primary="Orders" />
          {ordersOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={ordersOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            <SubHoverableListItem
              label="Order Status"
              icon={<img src="../public/assets/adminorder.png" alt="Orders" style={{ width: '33px', height: '33px' }} />}
              isSelected={selectedItem === 'Orders'}
              onClick={() => handleListItemClick('Orders')}
              sx={{ pl: 4 }}
            />
            <SubHoverableListItem
              label="Cancel Requests"
              icon={<img src="../public/assets/cancel.png" alt="Cancellation Requests" style={{ width: '26px', height: '26px' }} />}
              isSelected={selectedItem === 'Cancellation Requests'}
              onClick={() => handleListItemClick('Cancellation Requests')}
              sx={{ pl: 4 }}
            />
          </List>
        </Collapse>
        <HoverableListItem
          icon={<img src="../public/assets/customize.png" alt="Request" style={{ width: '33px', height: '33px' }} />}
          label="Customization Request"
          isSelected={selectedItem === 'Customization Request'}
          onClick={() => handleListItemClick('Customization Request')}
        />
        <HoverableListItem
          icon={<img src="../public/assets/transaction.png" alt="Transaction History" style={{ width: '33px', height: '33px' }} />}
          label="Transaction History"
          isSelected={selectedItem === 'Transaction History'}
          onClick={() => handleListItemClick('Transaction History')}
        />
      </List>
    </div>
  );
  
  let content;
  switch (selectedItem) {
    case 'Product Inventory':
      content = <ProductInventory />;
      break;
    case 'Orders':
      content = <Orders />;
      break;
    case 'Customization Request':
      content = <CustomRequest />;
      break;
    case 'Transaction History':
      content = <TransactionHistory />;
      break;
    case 'Cancellation Requests':
      content = <CancelOrderRequest/>;
      break;
    default:
      content = null;
  }

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Popover
      id={menuId}
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={handleMenuClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
    >
      <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center' }}>
        <LogoutIcon fontSize='small' />
        <Typography  sx={{ marginLeft: 1, fontFamily: 'Kanit', fontSize: '0.95rem' }}>Logout</Typography>
      </MenuItem>
    </Popover>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(mobileMoreAnchorEl)}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleNotificationOpen} sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="large" color="inherit" sx={{ marginRight: 1 }}>
          <Badge badgeContent={notifCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Typography variant="body1">Notifications</Typography>
      </MenuItem>
      <Popover
        id={notificationID}
        open={openNotication}
        anchorEl={notificationAnchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography sx={{ p: 2, fontFamily: 'Kanit', fontWeight: 'bold' }}>Notifications</Typography>
        <Divider sx={{ backgroundColor: 'black' }} />
        <List>
          {notificationData.length > 0 ? (
            notificationData.map((notifs, index) => (
              <ListItem key={index} sx={{ opacity: notifs.notificationStatus === 'read' ? 0.5 : 1 }}>
                <ListItemIcon>
                  <ReceiptIcon fontSize="medium" sx={{ margin: 'auto', color: 'green' }} />
                </ListItemIcon>
                <Box sx={{ flexGrow: 1 }}>
                  <ListItemText 
                    primary={notifs.notificationMessage} 
                    secondary={`${notifs.notificationDate} - ${notifs.notificationTime}`} 
                    primaryTypographyProps={{ 
                      fontSize: '0.7rem', 
                      fontFamily: 'Kanit', 
                      fontWeight: 650,
                    }} 
                    secondaryTypographyProps={{ 
                      fontSize: '0.6rem', 
                      fontFamily: 'Kanit',
                    }} 
                  />
                </Box>
              </ListItem>
            ))
          ) : (
            <Typography sx={{ p: 2, fontFamily: 'Kanit', fontSize: '0.9rem', alignContent: 'center' }}>No notifications available.</Typography>
          )}
        </List>
        <Divider sx={{ backgroundColor: 'black' }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
          <Button
            size="small"
            startIcon={<MailIcon />}
            onClick={handleMarkAllAsRead}
            sx={{ fontSize: '0.65rem', color: 'gray' }}
            disabled={notificationData.length === 0}
          >
            Mark All as Read
          </Button>
          <Button
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteAllNotifications}
            sx={{ fontSize: '0.65rem', color: 'gray' }}
            disabled={notificationData.length === 0}
          >
            Delete All 
          </Button>
        </Box>
      </Popover>
      <MenuItem onClick={handleLogout} sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton size="large" color="inherit" sx={{ marginRight: 1 }}>
          <LogoutIcon />
        </IconButton>
        <Typography variant="body1">Logout</Typography>
      </MenuItem>
    </Menu>
  );
  
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#F4F4F4' }}>
      <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="black"
              aria-label="open drawer"
              sx={{ mr: 2 }}
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src="../public/assets/Logo.jpg"
                width={100}
                height={40}
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, alignItems: 'center' }}
              />
            </div>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <IconButton
                size="large"
                color="black"
                onClick={handleNotificationOpen}
              >
            <Badge badgeContent={notifCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
            <Popover
              id={notificationID}
              open={openNotication}
              anchorEl={notificationAnchorEl}
              onClose={handleNotificationClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Typography sx={{ p: 2, fontFamily: 'Kanit', fontWeight: 'bold' }}>Notifications</Typography>
              <Divider sx={{ backgroundColor: 'black' }} />
              <List>
                {notificationData.length > 0 ? (
                  notificationData.map((notifs, index) => (
                    <ListItem key={index} sx={{ opacity: notifs.notificationStatus === 'read' ? 0.5 : 1 }}>
                      <ListItemIcon>
                        <ReceiptIcon fontSize="medium" sx={{ margin: 'auto', color: 'green' }} />
                      </ListItemIcon>
                      <Box sx={{ flexGrow: 1 }}>
                      <ListItemText 
                        primary={notifs.notificationMessage} 
                        secondary={`${notifs.notificationDate} - ${notifs.notificationTime}`} 
                        primaryTypographyProps={{ 
                          fontSize: '0.7rem', 
                          fontFamily: 'Kanit', 
                          fontWeight: 650,
                        }} 
                        secondaryTypographyProps={{ 
                          fontSize: '0.6rem', 
                          fontFamily: 'Kanit',
                        }} 
                      />
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography sx={{ p: 2, fontFamily: 'Kanit', fontSize: '0.9rem', alignContent: 'center' }}>No notifications available.</Typography>
                )}
              </List>
              <Divider sx={{ backgroundColor: 'black' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1 }}>
                <Button
                  size="small"
                  startIcon={<MailIcon />}
                  onClick={handleMarkAllAsRead}
                  sx={{ fontSize: '0.65rem', color: 'gray' }}
                  disabled = {notificationData.length == 0 ? true : false}
                >
                  Mark All as Read
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={handleDeleteAllNotifications}
                  sx={{ fontSize: '0.65rem', color: 'gray' }}
                  disabled = {notificationData.length == 0 ? true : false}
                >
                  Delete All 
                </Button>
            </Box>
            </Popover>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="black"
              >
                <AccountCircle />
              </IconButton>
            </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="black"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        variant={isMobile ? 'temporary' : 'permanent'}
      >
        {drawerContent}
      </Drawer>
      <Box display="flex">
        {!isMobile && (
          <Box flex="1" maxWidth="15vw" sx={{ backgroundColor: 'black', height: '100%', pb: '80vh' }}>
            {drawerContent}
          </Box>
        )}
         <Box flex="1" sx={{ backgroundImage: 'url(../public/assets/shopGraffiti1.png)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
          {isLoading ? (
            <PreLoader />
          ) : (
            content
          )}
        </Box>
      </Box>
      {renderMobileMenu}
      {renderMenu}
    </Box>
    </div>
  );
};

export default Admin;
