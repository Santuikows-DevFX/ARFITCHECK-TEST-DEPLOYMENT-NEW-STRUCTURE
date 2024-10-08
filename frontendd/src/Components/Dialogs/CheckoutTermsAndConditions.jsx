import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';

const CheckoutTermsAndConditions = ({ open, onClose, onAgree }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
        <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 30 } }}>
              TERMS AND CONDITIONS
          </Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <DialogContent dividers>
            <Typography sx={{ fontFamily: 'Kanit', fontSize: 15, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
                <strong>1. Introduction</strong>
                <br />
                Welcome to <b>BMIC.</b> By making a purchase, you agree to abide by the following terms and conditions. Please read them carefully.
                <br /><br />

                <strong>2. Order Accuracy</strong>
                <br />
                It is your responsibility to ensure that your order is correct before finalizing the purchase. BMIC are not responsible for any errors in your order.
                <br /><br />

                <strong>3. Payment Details</strong>
                <br />
                You agree to provide accurate payment information and ensure that the payment details are correct. Orders will only be processed once payment is confirmed.
                <br /><br />

                <strong>4. Refund Policy</strong>
                <br />
                Any issues regarding refunds will be addressed through the BMIC Facebook page. Please contact us there for any refund inquiries.
                <br /><br />

                <strong>5. Cancellation Policy</strong>
                <br />
                You may cancel your order before it is shipped. Once an order is shipped, cancellation is not guaranteed.
                <br />
                If you cancel your order and paid using an e-wallet (e.g., PayMaya, GCash), refunds are typically processed immediately upon approval of the cancellation request. It may take <b>2-3</b> business days for the refund to reflect in your e-wallet account.
                <br /><br />

                <strong>6. Acceptance</strong>
                <br />
                By clicking <b>"Agree,"</b> you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
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

export default CheckoutTermsAndConditions;
