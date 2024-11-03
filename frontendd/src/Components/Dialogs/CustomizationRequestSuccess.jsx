import React from 'react';
import { Grid, IconButton, Typography, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FilledButton } from '../UI/Buttons';
import { useNavigate } from 'react-router-dom';
import successImage from '../../../public/assets/success_edited.png';

function CustomizationRequestSuccess({ onClose, timeStamp }) {

  const CartValidationSchema = Yup.object().shape({
    cart: Yup.string().required('Product quantity is required'),
  });

  const navigate = useNavigate();
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
            <IconButton onClick={onClose} sx={{ position: 'absolute', top: 0, right: 0 }}>
              <CloseIcon />
            </IconButton>
            <Grid
              container
              direction="column"
              alignItems="center"
              justifyContent="center"
              sx={{
                backgroundColor: '#F5F7F8',
                padding: '2vh',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <img
                src={successImage}
                alt="Success"
                style={{
                  width: '60%',
                  maxWidth: '400px',
                  marginBottom: '-10px'
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'Kanit',
                  fontSize: { xs: 15, sm: 25 },
                  color: '#1E7F1C',
                  paddingY: { xs: '1vh', md: '0.6vh'},
                }}
              >
                <b>THANK YOU!</b> <br /> <span style={{ fontWeight: 500 }}> Your order has been placed! Remember to always check your email for notifications.</span>
              </Typography>
              <Button
                type="submit"
                fullWidth
                onClick={() => {
                  navigate('/shop', { replace: true });
                }}
                variant="contained"
                sx={{
                  backgroundColor: 'white',
                  "&:hover": {
                    backgroundColor: '#414a4c',
                    color: 'white',
                  },
                  "&:not(:hover)": {
                    backgroundColor: '#3d4242',
                    color: 'white',
                  },
                  background: 'linear-gradient(to right, #414141, #000000)',
                  mt: { xs: 0.7, md: 1}
                }}
              >
                <Typography
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: { xs: 14, md: 20 },
                    padding: 0.5,
                  }}
                >
                  SHOP AGAIN
                </Typography>
              </Button>
            </Grid>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default CustomizationRequestSuccess;
