import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Grid, Box, IconButton, Typography, Rating, CircularProgress, DialogTitle, Button } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { FilledButton } from '../UI/Buttons';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import axiosClient from '../../axios-client';
import { toast, ToastContainer, Bounce } from 'react-toastify';
import { Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';


function ProductRating({ product, onClose, open, orderID, fetchMyOrders }) {

  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar  } = useSnackbar();
  
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

        enqueueSnackbar(`${data.message}`, { 
          variant: 'success',
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'right'
          },
          autoHideDuration: 1800,
          style: {
            fontFamily: 'Kanit',
            fontSize: '16px'
          },
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
       <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                QUICK RATING / REVIEW
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
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
              <Button
                type="submit"
                fullWidth
                disabled = {loading || isSubmitting}
                variant="contained"
                sx={{
                  backgroundColor: "White",
                  "&:hover": {
                    backgroundColor: "#414a4c",
                    color: "white",
                  },
                  "&:not(:hover)": {
                    backgroundColor: "#3d4242",
                    color: "white",
                  },
                  background:
                    "linear-gradient(to right, #414141, #000000)",
                  opacity: loading  ? 0.7 : 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Kanit",
                    fontSize: { xs: 18, md: 25 },
                    padding: 0.5,
                    visibility: loading ? "hidden" : "visible",
                  }}
                >
                  RATE
                </Typography>
                {loading && (
                  <CircularProgress
                    size={24}
                    color="inherit"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
    </div>
  );
}

export default ProductRating;
