import {
  Box,
  Typography,
} from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import * as React from 'react';
import OrderHistoryTable from '../../Components/Tables/OrderHistoryTable';
import Details from '../../Components/Detais'

function OrderHistory() {
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
        <Box sx = {{minHeight: "100vh"}}>
          <Details/>
          <OrderHistoryTable/>
        </Box>
      )}
    </div>
  );
}

export default OrderHistory;