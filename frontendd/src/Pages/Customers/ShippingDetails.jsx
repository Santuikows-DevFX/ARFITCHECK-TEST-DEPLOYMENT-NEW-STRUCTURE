import React from 'react';
import { Typography, Box } from '@mui/material';
import Shipping from '../../Components/Forms/Shipping';
import PreLoader from '../../Components/PreLoader';
import Details from '../../Components/Detais';
import { ToastContainer } from 'react-toastify';
function ShippingDetails() {
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
      <Box m={2} sx={{ minHeight: '100vh' }}>
      <Details/>
      <Shipping/>
      </Box>
      )}
    </div>
  );
}

export default ShippingDetails;