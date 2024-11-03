import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Backdrop, CircularProgress } from '@mui/material';
import { Email, Sms } from '@mui/icons-material';
import { Close, Warning } from '@mui/icons-material';

const VerificationMethods = ({ open, onClose, handleSendEmailOTP, handleResendCode, resendLoading }) => {

  useEffect(() => {
    if (resendLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [resendLoading]);

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 34 } }}>
                  OTHER METHOD
              </Typography>
              <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
            </DialogTitle> 
        <DialogContent>
          <Box sx={{ textAlign: 'center'}}>
            <Button
                variant="contained"
                fullWidth
                disabled = {resendLoading}
                startIcon = {<Email/>}
                sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: '#196F3D', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#239B56', color: 'white' },
                    cursor: 'pointer',
                    opacity: resendLoading ? 0.4 : 1,
                    mb: 2
                }}
                onClick={() => {
                    handleSendEmailOTP();
                }}
            >
            <Typography
                sx={{
                    fontFamily: 'Kanit',
                    fontSize: { xs: 12, md: 20 },
                    color: 'white',
                    ml: 1,
                }}
            >
              Send OTP-Code via Email
            </Typography>
            </Button>
            <Button
                variant="contained"
                fullWidth
                disabled = {resendLoading}
                startIcon = {<Sms/>}
                sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: 'black', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#232323', color: 'white' },
                    cursor: 'pointer',
                    opacity: resendLoading ? 0.4 : 1,
                    mb: 1
                }}
                onClick={() => {
                    handleResendCode();
                }}
            >
            <Typography
                sx={{
                    fontFamily: 'Kanit',
                    fontSize: { xs: 12, md: 20 },
                    color: 'white',
                    ml: 1,
                }}
            >
              Send OTP-Code via SMS
            </Typography>
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationMethods;
