import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import * as React from 'react';
import ChangePassword from '../../Components/Forms/ChangePassword';
import ProfileInformation from '../../Components/Forms/ProfileInformation';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Details from '../../Components/Detais';
import { ToastContainer } from 'react-toastify';

function AccountSettings() {
  document.documentElement.style.setProperty('--primary', 'black');
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
         <Box m={2}sx = {{minHeight: "100vh"}}>
        <Details/>
          <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 20, md: 40 }, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
            Account Settings
          </Typography>
          <Accordion sx={{ marginBottom: { xs: "5%", md: "1%" }, borderRadius: '5px',  boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.4)', background: 'linear-gradient(to right, #D7E1EC  , #FFFFFF)' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 25 }, fontWeight: 'bold', color: 'black'}}>
                Change Password <br/>
                <Typography sx={{ fontFamily: 'Kanit', fontSize:  { xs: 12, md: 15 }, fontWeight: '300', color: 'black' }}>
                  Update your password to keep your account secure.
                </Typography>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
            <ChangePassword/>
            </AccordionDetails>
          </Accordion>
            <Accordion sx={{ marginBottom: '1%', borderRadius: '10px',  boxShadow: '0px 6px 6px rgba(0, 0, 0, 0.4)', background: 'linear-gradient(to right, #D7E1EC  , #FFFFFF)'  }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 25 }, fontWeight: 'bold', color: 'black' }}>
                  Profile Information <br/>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 15 }, fontWeight: '300', color: 'black' }}>
                    Configure your profile.
                  </Typography>
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <ProfileInformation/>
              </AccordionDetails>
            </Accordion>
        </Box>
       </div>
      )}
    </div>
  );
}

export default AccountSettings;