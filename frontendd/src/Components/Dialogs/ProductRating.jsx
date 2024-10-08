import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Grid, Box, IconButton, Typography, Rating, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FilledButton } from '../UI/Buttons';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import axiosClient from '../../axios-client';
import { toast, ToastContainer, Bounce } from 'react-toastify';

function ProductRating({ product, onClose, open, orderID, fetchMyOrders }) {

  const [loading, setLoading] = useState(false)
  
  const RatingValidationSchema = Yup.object().shape({
    rating: Yup.number().required('Rating is required'),
  });

  const handleRateOrder = (values) => {

    setLoading(true)

    try {

      axiosClient.post('order/updateProductRatingBasedOnOrder', 
      { orderID: orderID,
        associatedOrderID: orderID,
        productRating: values.rating
      }).then(( {data} ) => {

        toast.success(data.message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
          style: { fontFamily: 'Kanit', fontSize: '16px' }
        });

        fetchMyOrders();
        setLoading(false)
        onClose();
      })

    }catch(error) {
      console.log(error);
      
    }
  }

  return (
    <div>
       <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2 }}>
        <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 22, sm: 28 }, fontWeight: 'bold', textAlign: 'center' }}>
          Quick Rating / Review 
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </Box>

      <Formik
        initialValues={{ rating: 0 }}
        validationSchema={RatingValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleRateOrder(values)
          setSubmitting(false);
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Grid container justifyContent="center" alignItems="center" textAlign="center">
                <Grid item xs={12}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 16, sm: 18 }, fontWeight: '300', mb: 3 }}>
                    Rate the product, its quality, design, and the order experience
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Rating
                    name="product-rating"
                    value={values.rating}
                    onChange={(event, newValue) => setFieldValue('rating', newValue)}
                    emptyIcon={<StarBorderIcon style={{ color: 'black', fontSize: 50 }} />}
                    icon={<StarIcon style={{ color: 'black', fontSize: 50 }} />}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
              <FilledButton type="submit" sx={{ width: '80%' }} disabled={isSubmitting}>
                <Typography
                  sx={{
                    fontFamily: 'Kanit',
                    fontSize: { xs: 18, md: 25 },
                    padding: 0.5,
                    visibility: loading ? 'hidden' : 'visible',
                  }}
                >
                  RATE
                </Typography>
                {loading && (
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </FilledButton>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
    </div>
  );
}

export default ProductRating;
