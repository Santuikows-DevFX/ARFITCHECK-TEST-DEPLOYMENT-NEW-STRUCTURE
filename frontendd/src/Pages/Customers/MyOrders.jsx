import {
  Box,
  Typography,
} from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import * as React from 'react';
import OrdersTable from '../../Components/Tables/OrdersTable';
import Details from '../../Components/Detais'

function MyOrders() {

  const [isLoading, setIsLoading] = React.useState(true);
  document.documentElement.style.setProperty('--primary', 'black');
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
        <Box sx = {{minHeight: "100vh"}}>
       <Details/>
        <OrdersTable/>
        </Box>
      )}
    </div>
  );
}

export default MyOrders;