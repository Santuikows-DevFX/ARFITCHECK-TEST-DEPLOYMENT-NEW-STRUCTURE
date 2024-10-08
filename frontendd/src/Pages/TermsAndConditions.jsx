import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

const TermsAndConditions = ({ open, onClose, onAgree }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md"   sx={{ 
      borderRadius: '5px', 
      '& .MuiDialog-paper': { borderRadius: '16px' } 
    }}>
       <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                TERMS AND CONDITIONS
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
      <DialogContent>
        <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
          <strong>1. Introduction</strong>
          <br />
          Welcome to ARFITCHECK. By signing up, you agree to abide by the following terms and conditions. Please read them carefully.
          <br /><br />
          
          <strong>2. Personal Information</strong>
          <br />
          By registering, you consent to provide accurate and complete personal information. This includes, but is not limited to, your name, email address, phone number, fulladdress, and other necessary details.
          <br /><br />
          
          <strong>3. Use of Information</strong>
          <br />
          Your personal information will be used for account creation, management, and communication purposes. We ensure that your data is protected and only used for the intended purposes.
          <br /><br />
          
          <strong>4. Privacy Policy</strong>
          <br />
          We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, use, and safeguard your information.
          <br /><br />
          
          <strong>5. Account Security</strong>
          <br />
          You are responsible for maintaining the confidentiality of your account details, including your password. 
          <br /><br />
          
          <strong>6. User Conduct</strong>
          <br />
          You agree to use the application in accordance with all applicable laws and regulations. Any misuse of the application may result in termination of your account.
          <br /><br />
          
          <strong>7. Changes to Terms</strong>
          <br />
          We reserve the right to update these terms and conditions at any time. Changes will be notified to you via email or through the application.
          <br /><br />
          
          <strong>8. Acceptance</strong>
          <br />
          By clicking "Agree," you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick= {onAgree}>
          <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black' }}>
            Agree
          </Typography>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TermsAndConditions;