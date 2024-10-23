import React from 'react';
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewCustomProductDetails = ({
  open,
  onClose,
  orderInfo,
  customImage,
  smallQnt,
  mediumQnt,
  largeQnt,
  extraLargeQnt,
  doubleXLQnt,
  tripleXLQnt
}) => { 

  const customImageSRC = orderInfo?.customImage ? orderInfo?.customImage : `https://storage.googleapis.com/${customImage}`;

  const openImageInNewTab = (imageUrl) => {
    
    imageUrl === orderInfo?.customImage ? window.open(imageUrl, '_blank') : ''; 
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <DialogTitle
          sx={{
            background: 'linear-gradient(to left, #414141, #000000)',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: { xs: 25, md: 40 } }}>
            CUSTOMIZED PRODUCT DETAILS
          </Typography>
          <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} alignItems="center">
            <Grid 
              item
              mt={2}
              xs={12}
              sm={6}
              sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <img
                src={customImageSRC}
                onClick={() => openImageInNewTab(customImageSRC)}
                alt="Product"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: '250px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease-in-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Divider sx={{ mb: 2 }} />

              {[
                { label: "Small Qnt:", value: orderInfo?.smallQuantity || smallQnt},
                { label: "Medium Qnt:", value: orderInfo?.mediumQuantity || mediumQnt},
                { label: "Large Qnt:", value: orderInfo?.largeQuantity || largeQnt},
                { label: "Extra Large Qnt:", value: orderInfo?.extraLargeQuantity || extraLargeQnt},
                { label: "Double XL Qnt:", value: orderInfo?.doubleXLQuantity || doubleXLQnt},
                { label: "Triple XL Qnt:", value: orderInfo?.tripleXLQuantity || tripleXLQnt},
              ].map(({ label, value }, index) => (
                <Grid 
                  key={index} 
                  container 
                  justifyContent="space-between" 
                  sx={{ fontFamily: 'Kanit', mb: 1 }}
                >
           
                  <Grid item xs={6}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 25 }, fontWeight: 'bold', color: 'black' }}><b>{label}</b></Typography>
                  </Grid>
                  <Grid item xs={6} >
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 30 }, fontWeight: 'light', color: 'black', textAlign: 'right' }}>{value}</Typography>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default ViewCustomProductDetails;
