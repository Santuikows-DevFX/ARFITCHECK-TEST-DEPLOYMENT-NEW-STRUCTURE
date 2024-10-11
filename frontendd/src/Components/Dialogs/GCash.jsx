import React from 'react'
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import gcashImage from '../../../public/assets/QRs/GCash.jpg'

const GCash = ({ open, onClose }) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { borderRadius: 4 }, 
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 20, md: 30 } }}>
          Scan this QR Code:
        </DialogTitle>
        <DialogContent>
          <img src={gcashImage} style={{ width: "100%", height: "70%", objectFit: "cover" }} />
        </DialogContent>
        <IconButton sx={{ position: 'absolute', top: 5, right: 5 }} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Dialog>
    </div>
  );
}

export default GCash;
