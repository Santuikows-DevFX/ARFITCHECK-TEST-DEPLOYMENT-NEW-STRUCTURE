import React from 'react'
import { Box, Typography, Divider, Grid, Avatar, IconButton } from '@mui/material';
import { ExcelButton} from '../../Components/UI/Buttons';
import PreLoader from '../../Components/PreLoader';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import OrderStatusTable from '../../Components/Tables/OrderStatusTable';
import { ToastContainer } from 'react-toastify';

function Orders() {
  const [isLoading, setIsLoading] = React.useState(true);
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);
  return (
    <div>
        {isLoading ? (
        <PreLoader />
      ) : (
        <div>
        <Box m={2} >
        <Grid container direction="column" spacing={2}>
          <Grid item container justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontFamily: 'Kanit', fontSize: 50, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
              Order Status
            </Typography>
            <Grid container spacing={4} sx={{ width: "45%", justifyContent:'flex-end', alignItems: "center" }}>
           
          </Grid>
          </Grid>
          <Grid item>
            <Divider sx={{ borderTopWidth: 2, mb : 3 }}/>
          </Grid>
        </Grid>
        <OrderStatusTable/>
      </Box>
        <ToastContainer />
     </div>
      )}
    </div>
  )
}

export default Orders