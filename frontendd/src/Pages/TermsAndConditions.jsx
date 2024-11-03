import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import { OpenInNew } from '@mui/icons-material';

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
        <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 9, md: 15 }, fontWeight: 'normal', color: 'gray', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
          Last Updated: Nov 1, 2024
        </Typography>
        <Typography sx={{ fontFamily: 'Kanit',fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh', maxHeight: '60vh', overflow: 'auto' }}>
          <strong>1. Introduction</strong>
          <br />
          Welcome to <i>B.MIC</i>. By signing up, you agree to abide by the following terms and conditions. Please read them carefully.
          <br /><br />
          
          <strong>2. Personal Information</strong>
          <br />
          By registering, you consent to provide accurate and complete personal information. This includes, but is not limited to, your name, email address, phone number, fulladdress, and other necessary details.
          <br /><br />
          
          <strong>3. Use of Information</strong>
          <br />
          Your personal information will be used for account creation, transactions, and communication purposes. We, <i>"B.MIC"</i>, ensure that your data is protected and only used for the intended purposes.
          <br /><br />
          
          <strong>4. Privacy Policy</strong>
            <br />
             Your privacy is important to us at <i>B.MIC</i>. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use system. By signing up, you consent to the following practices:
            <ul style={{ marginTop: 10 }}>
              <li><strong>Data Collection:</strong> We collect personal information, such as your full name, email, address details, and transaction history, to provide a efficient ordering experience.</li>
              <li><strong>Usage of Information:</strong> Your data is used solely for order processing, transactions, and communication purposes.</li>
              <li><strong>Third-Party Disclosure:</strong> We do not sell, trade, or otherwise transfer your personal information to external parties except for essential service providers involved in the fulfillment of orders or regulatory bodies if required by law.</li>
              <li><strong>Data Retention:</strong> We retain your information as long as your account is active or as necessary to comply with legal obligations.</li>
              <li><strong>Access and Correction:</strong> You have the right to access, correct, or delete your personal information, subject to certain limitations as per legal requirements. For any requests, please contact us at <span style={{ fontWeight: 600 }}>bmicclothes@gmail.com</span>.</li>
            </ul>
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

          <strong>8. Order Processing</strong>
            <br />
            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh' }}>
              To ensure a smooth ordering experience, please review the following terms regarding order processing:
            </Typography>
            <ul style={{ marginTop: 10 }}>
              <li><strong>Order Accuracy:</strong> It is your responsibility to ensure that your order is correct before finalizing the purchase. <i>B.MIC</i> is not responsible for any errors in your order. Once confirmed, orders cannot be modified.</li>
              <li><strong>Payment Details:</strong> You agree to provide accurate payment information and ensure that the payment details are correct.</li>
              <li><strong>Cancellation Policy:</strong> You may cancel your order(s) before it is shipped for delivery. Once an order is shipped, cancellation is not guaranteed. If you cancel your order and paid using an E-Wallet <i>(e.g., PayMaya, GCash)</i>, refunds are typically processed immediately upon approval of the cancellation request. For some cases, it may take <b>1-2</b> business days for the refund to reflect in your E-Wallet account. If you have any inquiries regarding the cancellation of your order(s) or about refunds, you may contact us at <span style={{ fontWeight: 600 }}>bmicclothes@gmail.com</span> or reach out to our Facebook page <a href="https://www.facebook.com/bmic.clothing" target="_blank" rel="noopener noreferrer">B.MIC Facebook</a> <OpenInNew fontSize="0.5rem" style={{ verticalAlign: 'middle', color: 'blue' }} />.</li>
              <li><strong>Refund Policy:</strong> Any issues regarding orders and refunds will be addressed through the B.MIC Facebook Page. Kindly contact our Facebook page for any refund inquiries.</li>
            </ul>
            <strong>9. Customization Processing</strong>
              <br />
              <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 20 }, fontWeight: 'normal', color: 'black', paddingY: '1vh' }}>
                <ul style={{ marginTop: 10 }}>
                  <li><strong>Processing Time:</strong> Customization requests may require additional processing time compared to standard orders. We appreciate your patience as we ensure your customized items are completed accurately before shipment.</li>
                  <li>
                    <strong>Approval Process:</strong> Your customization requests will be subject for approval. If you have any inquiries about the update, you may contact us at <span style={{ fontWeight: 600 }}>bmicclothes@gmail.com</span> or reach out to our Facebook page <a href="https://www.facebook.com/bmic.clothing" target="_blank" rel="noopener noreferrer">B.MIC Facebook</a> <OpenInNew fontSize="0.5rem" style={{ verticalAlign: 'middle', color: 'blue' }} />.
                    <ul style={{ marginTop: 5 }}>
                      <li><strong>Notification of Update:</strong> You will be notified via email regarding the update of your customization requests.</li>
                      <li><strong>Timeframe for Approval:</strong> Please allow up to <b>2-3</b> business days for the approval process.</li>
                      <li><strong>Payment Timeframe After Approval:</strong> Payment processing will begin once your customization request is approved. You will have <b>2</b> days to complete the payment. Failure to do so within this timeframe will result in automatic cancellation of the request.</li>
                    </ul>
                  </li>
                  <br />
                  <li><strong>Quality Assurance:</strong> We strive to maintain high-quality standards for all customized items. However, minor variations in color or design may occur due to production processes. We will notify you via email if there are any significant changes to your customization request.</li>
                  <li><strong>Return Policy:</strong> Customized products are generally non-returnable unless there is a manufacturing defect. Please review your order carefully before submitting your customization request. In such cases, you may contact us at <span style={{ fontWeight: 600 }}>bmicclothes@gmail.com</span>.</li>
                </ul>
              </Typography>

          By clicking <i>"Agree,"</i> you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
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