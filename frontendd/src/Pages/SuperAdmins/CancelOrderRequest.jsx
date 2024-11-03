import React from 'react'
import { Box, Typography, Divider, Grid, Avatar, IconButton } from '@mui/material';
import { ExcelButton} from '../../Components/UI/Buttons';
import PreLoader from '../../Components/PreLoader';
import OrderStatusTable from '../../Components/Tables/OrderStatusTable';
import CancelRequestTable from '../../Components/Tables/CancelRequestTable';

function CancelOrderRequest() {
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
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 30, md: 50 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
              Cancel Requests
            </Typography>
            <Grid container spacing={4} sx={{ width: "45%", justifyContent:'flex-end', alignItems: "center" }}>
            <Grid item xs={6}>
            {/* <ExcelButton fullWidth>Download as Excel</ExcelButton> */}
            </Grid>
          </Grid>
          </Grid>
          <Grid item>
            <Divider sx={{ borderTopWidth: 2, mb : 3 }}/>
          </Grid>
        </Grid>
        <CancelRequestTable/>
      </Box>
     </div>
      )}
    </div>
  )
}

export default CancelOrderRequest