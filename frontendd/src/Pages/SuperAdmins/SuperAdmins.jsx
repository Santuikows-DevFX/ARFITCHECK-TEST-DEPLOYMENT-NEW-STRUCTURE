import React, { useState } from 'react';
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
  ListItemButton,
  Popover,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  useTheme,
  useMediaQuery,
  Divider,
  CssBaseline,
  Collapse
} from '@mui/material';

import { HoverableListItem, SubHoverableListItem } from '../../Components/UI/Buttons';
import PreLoader from '../../Components/PreLoader';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

import AnalyticsAndReports from './AnalyticsAndReports';
import Staffs from './Staffs';
import ProductInventory from './ProductInventory';
import Orders from './Orders';
import TransactionHistory from './TransactionHistory';
import { useCookies } from 'react-cookie';

import Swal from 'sweetalert2'
import CustomizationRequestTable from '../../Components/Tables/CustomizationRequestTable';
import CustomRequest from './CustomRequest';
import axiosClient from '../../axios-client';
import CancelOrderRequest from './CancelOrderRequest';
import {
  Menu as MenuIcon,
  AccountCircle,
  Mail as MailIcon,
  Notifications as NotificationsIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

//Drawer Icons
import TuneIcon from '@mui/icons-material/Tune';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import StraightenIcon from '@mui/icons-material/Straighten';
import InventoryIcon from '@mui/icons-material/Inventory';
import CancelScheduleSendIcon from '@mui/icons-material/CancelScheduleSend';
import OrderStatusTable from '../../Components/Tables/OrderStatusTable';
import HistoryIcon from '@mui/icons-material/History';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ClothingSize from './ClothingSize';
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../../ContextAPI/ContextAPI';
import Footer from '../../Components/Footer';

import superAdminBG from '../../../public/assets/shopGraffiti1.png'

const SuperAdmin = (props) => {
  const { window } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [productsOpen, setProductsOpen] = useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [notificationAnchorEl, setNotificationAnchroEl] = React.useState(null)

  const [drawerOpen, setDrawerOpen] = React.useState(!isMobile);
  const [selectedItem, setSelectedItem] = React.useState('Analytics And Reports');
  const [isLoading, setIsLoading] = React.useState(true);
  const [ordersOpen, setOrdersOpen] = React.useState(false)
  
  const [cookie, removeCookie, remove] = useCookies(['?tokenID', '?id'])
  const { setToken, setUserID, setRole } = useStateContext()

  const drawerWidth = 240;
  //notifacation fetching
  const [notificationData, setNotificationData] = React.useState([]);
  const [notifCount, setNotifCount] = React.useState(0);
  const container = window !== undefined ? () => window().document.body : undefined;

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const handleProductsClick = () => {
    setProductsOpen(!productsOpen);
  };
  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };
  //notification hook
  React.useEffect(() => {
    fetchNotificationData();
    fetchAndHandleNotifyOutForDeliveryOrders();
  }, [])

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };
  const iconMapping = {
    'Order Status': <AssignmentLateIcon/>,
    'Analytics And Reports': <InsightsIcon />,
    'Team': <GroupsIcon />,
    'Products': <CheckroomIcon />,
    'Product Inventory': <InsightsIcon />,
    'Orders': <AssignmentIcon/>,
    'Customization Request': <TuneIcon />,
    'Transaction History': <HistoryIcon />,
    'Cancel Requests': <CancelScheduleSendIcon/>,
    'Size Table': <StraightenIcon />,
    'Inventory': <InventoryIcon />,
  };

 const fetchNotificationData = async () => {

    try {

      const notificationResponse = await axiosClient.get(`/auth/fetchAdminNotifications/${cookie['?id']}`);
      if(notificationResponse.data) {

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
 }

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

          const timePassedSinceUpdate = currTime - updateTimeStamp;
          //CHECK IF THE CURRENT DATE AND THE ORDER DELIVERY DATE IS THE SAME, THIS WILL SERVE AS AN AUTOMATION THAT WILL NOTIFY THE USER IMMEDIATELY.
          if(orderDeliveryDate.toDateString() === currDate.toDateString() && timePassedSinceUpdate > estHoursOfDelivery) {
            notifyUsersIfDelivered();
          }else if (orderDeliveryDate.toDateString() !== currDate.toDateString() && timePassedSinceUpdate > estHoursOfDelivery) {
            //CHECK IF THE TIME PASSED IS GREATER THAN THE EST HOURS OF DELIVERY, MEANING THE ORDER IS DELIVERED
            notifyUsersIfDelivered();
          }

        });
        
      }

    }catch(error) {
      console.log(error);
    }
  }

  const notifyUsersIfDelivered = async () => {
    try { 

      await axiosClient.get('/order/automNotifyUsersWhenEstHrsMet');

    }catch(error) {
      console.log(error);
      
    }
  }

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOrdersClick = () => {
    setOrdersOpen(!ordersOpen);
  };

  const handleListItemClick = (item) => {
    setSelectedItem(item);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const drawer = (
    <div>
      <Typography  sx={{ fontSize: 30,fontWeight: 'bold' , fontFamily: 'Kanit', letterSpacing: '0.1rem',textAlign: 'center', color: "white", py: 1 }}>
        SUPER ADMIN
      </Typography>
      <Divider sx ={{ borderColor: 'white'}} />
      <List>
      {['Analytics And Reports', 'Team', 'Products', 'Orders', 'Customization Request', 'Transaction History'].map((text) => (
        <React.Fragment key={text}>
          {text === 'Orders' ? (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={handleOrdersClick}>
                  <ListItemIcon sx={{ color: "white" }}>
                    {iconMapping[text]}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" style={{ fontFamily: 'Kanit', color: "white" }}>
                        {text}
                      </Typography>
                    }
                  />
                  {ordersOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
                </ListItemButton>
              </ListItem>
              <Collapse in={ordersOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {['Order Status', 'Cancel Requests'].map((subText) => (
                    <ListItem key={subText} disablePadding>
                      <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick(subText)}>
                        <ListItemIcon sx={{ color: "white" }}>
                          {iconMapping[subText]}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" style={{ fontFamily: 'Kanit', color: "white" }}>
                              {subText}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          ) : text === 'Products' ? (
            <>
              <ListItem disablePadding>
                <ListItemButton onClick={handleProductsClick}>
                  <ListItemIcon sx={{ color: "white" }}>
                    {iconMapping[text]}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" style={{ fontFamily: 'Kanit', color: "white" }}>
                        {text}
                      </Typography>
                    }
                  />
                  {productsOpen ? <ExpandLess sx={{ color: "white" }} /> : <ExpandMore sx={{ color: "white" }} />}
                </ListItemButton>
              </ListItem>
              <Collapse in={productsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {['Inventory', 'Size Table'].map((subText) => (
                    <ListItem key={subText} disablePadding>
                      <ListItemButton sx={{ pl: 4 }} onClick={() => handleListItemClick(subText)}>
                        <ListItemIcon sx={{ color: "white" }}>
                          {iconMapping[subText]}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" style={{ fontFamily: 'Kanit', color: "white" }}>
                              {subText}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </>
          ) : (
            <ListItem key={text} disablePadding>
              <ListItemButton onClick={() => handleListItemClick(text)}>
                <ListItemIcon sx={{ color: "white" }}>
                  {iconMapping[text]}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" style={{ fontFamily: 'Kanit', color: "white" }}>
                      {text}
                    </Typography>
                  }
                />
              </ListItemButton>
            </ListItem>
          )}
        </React.Fragment>
      ))}
    </List>
    </div>
  );
  
  const navigator = useNavigate();
  const handleLogout = () => {

    setAnchorEl(null);
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
      fetchNotificationData();
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
  
  const renderContent = () => {
    switch (selectedItem) {
      case 'Analytics And Reports':
        return <AnalyticsAndReports/>;
        case 'Team':
          return <Staffs/>;
          case 'Inventory':
            return <ProductInventory/>;
            case 'Size Table':
              return <ClothingSize/>;
        case 'Order Status':
          return <Orders/>;
          case 'Cancel Requests':
            return <CancelOrderRequest/>;
            case 'Customization Request':
              return <CustomRequest/>;
              case 'Transaction History':
                return <TransactionHistory/>;
      default:
        return <AnalyticsAndReports/>;
    }
  };

  return (
    <div>
     <Box
      sx={{
        display: 'flex',
        backgroundImage: `url(${superAdminBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },

          backgroundColor: '#F4F4F4'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <IconButton
            color="black"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
            <Box
              sx={{
                width: { xs: 80, sm: 100, md: 120 },
                height: { xs: 35, sm: 40, md: 50 },
              }}
            />
              
              <Box>
              <IconButton
                onClick={handleNotificationOpen}
                color="black"
              >
                  <Badge badgeContent={notifCount} color="error">
                <NotificationsIcon/>
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
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notificationData.length > 0 ? (
                    notificationData.map((notifs, index) => (
                      <ListItem key={index} sx={{ opacity: notifs.notificationStatus === 'read' ? 0.5 : 1 }}>
                        <ListItemIcon>
                          <LocalShippingIcon fontSize="medium" sx={{ margin: 'auto', color: 'green' }} />
                        </ListItemIcon>
                        <Box sx={{ flexGrow: 1 }}>
                          <ListItemText 
                            primary={notifs.notificationMessage} 
                            secondary={`${notifs.notificationDate} - ${notifs.notificationTime}`} 
                            primaryTypographyProps={{ 
                              fontSize: '0.7rem', 
                              fontFamily: 'Kanit', 
                              fontWeight: 650,
                              sx: { wordBreak: 'break-word' },
                            }} 
                            secondaryTypographyProps={{ 
                              fontSize: '0.6rem', 
                              fontFamily: 'Kanit',
                              sx: { wordBreak: 'break-word' }, 
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
                    disabled={notificationData.length == 0 ? true : false}
                  >
                    Mark All as Read
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteAllNotifications}
                    sx={{ fontSize: '0.65rem', color: 'gray' }}
                    disabled={notificationData.length == 0 ? true : false}
                  >
                    Delete All 
                  </Button>
                </Box>
              </Popover>

              <IconButton
                onClick={handleProfileMenuOpen}
                color="black"
              >
                <AccountCircle />
              </IconButton>
     
              </Box>

              <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    elevation: 0,
                    sx: {
                      mt: 5,
                      '& .MuiMenuItem-root': {
                        display: 'flex',
                        alignItems: 'center',
                        
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >

                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon sx={{ mr: 1, fontsize: { xs: 10, sm: 10, md: 10 } }} />
                    <Typography sx = {{fontFamily: "kanit"}}> Logout</Typography>
                  </MenuItem>
                </Menu>
        </Toolbar>
  
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth,  backgroundColor: '#353535' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#353535' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, px: 1, py: 5, width: { sm: `calc(100% - ${drawerWidth}px)` }, minHeight: '100vh' }}
      >
        {renderContent()}
      </Box>
    </Box>
      </div>
  );
};

export default SuperAdmin;