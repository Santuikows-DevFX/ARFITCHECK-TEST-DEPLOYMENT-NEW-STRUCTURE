import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';

const containerStyle = {
  backgroundColor: '#ffffff',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  marginTop: '50px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const iconStyle = {
  color: '#4caf50',
  fontSize: '5rem',
  marginBottom: '16px',
};

const buttonStyle = {
  marginTop: '16px',
};

const OrderSuccess = () => {


  return (
    <Container maxWidth="md" style={containerStyle}>
      <CheckCircleOutlineIcon style={iconStyle} />
      <Typography variant="h5" gutterBottom>Thank you for your purchase!</Typography>
      <Button
        variant="contained"
        color="primary"
        style={buttonStyle}
        component = {Link} to = "/shop"
      >
        Go Back
      </Button>
    </Container>
  );
}

export default OrderSuccess;
