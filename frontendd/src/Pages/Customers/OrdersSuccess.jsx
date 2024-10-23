import React from 'react';
import { Grid, Box, Typography, Divider, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import Footer from '../../Components/Footer';
import successImage from '../../../public/assets/success.svg'

function OrderSuccess() {
  return (
    <div>
    <Formik
      initialValues={{ cart: '' }}
      validationSchema={CartValidationSchema}
      onSubmit={(values, { setSubmitting }) => {
        console.log('Profile Form submitted:', values);
        setSubmitting(false);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Grid container spacing={0}>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                backgroundColor: '#F5F7F8',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '2vh',
              }}
            >
              <img
                src={successImage}
                width="100%"
                maxWidth={600}
                height="auto"
                alt="Success"
              />
             <Typography
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs: 15, sm: 25 },
                  fontWeight: 700,
                  color: '#1E7F1C',
                  paddingY: '1vh',
                }}
              >
                THANK YOU! <br /> Your order has been received! Always check your email for notifications.
              </Typography>
              <FilledButton
                onClick={() => navigate('/shop')}
                sx={{ marginTop: '1vh' }}
              >
                SHOP AGAIN
              </FilledButton>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              sx={{ backgroundColor: '#F5F7F8', overflow: 'auto', padding: '2vh' }}
            >
              <Grid container spacing={0}>
                <Grid
                  item
                  xs={11}
                  sx={{
                    backgroundColor: '#F5F7F8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ marginX: 'auto', paddingY: '3vh' }}>
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs: 28, sm: 40 },
                        fontWeight: 'bold',
                        color: 'BLACK',
                        textAlign: 'center',
                      }}
                    >
                      ORDER INFO
                    </Typography>
                    <OrderInfo />
                    <Typography
                      sx={{
                        fontFamily: 'Kanit',
                        fontSize: { xs: 28, sm: 40 },
                        fontWeight: 'bold',
                        color: 'BLACK',
                        textAlign: 'center',
                        pt: 2,
                      }}
                    >
                      ORDER DETAILS
                    </Typography>
                    <OrderDetails />
                  </Box>
                </Grid>
                <Grid
                  item
                  xs={1}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <IconButton onClick={onClose}>
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  </div>
  );
}

export default OrderSuccess;