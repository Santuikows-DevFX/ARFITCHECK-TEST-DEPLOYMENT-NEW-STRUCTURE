import {
    Box,
    Typography,
  } from '@mui/material';
  import PreLoader from '../../Components/PreLoader';
  import * as React from 'react';
  import OrdersTable from '../../Components/Tables/OrdersTable';
  import Details from '../../Components/Detais'
import MyCustomizationRequestsTable from '../../Components/Dialogs/MyCustomizationRequestsTable';
  
  function MyCustomizationRequests() {
  
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
          <MyCustomizationRequestsTable/>
          </Box>
        )}
      </div>
    );
  }
  
  export default MyCustomizationRequests;