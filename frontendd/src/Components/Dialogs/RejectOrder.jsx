import React from 'react';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Divider } from '@mui/material';
import { Formik, Form, Field, } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2'
import axiosClient from '../../axios-client';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { Close } from '@mui/icons-material';


const RejectOrder = ({ open, onClose, reqData, zIndex, fetchOrders}) => {

  const reasonValidationSchema = Yup.object().shape({
        reason: Yup.string().required('Reason is required')
  });

  const updateOrd = (values) => {
    
    const orderData = {
        orderID: reqData?.orderID,
        associatedOrderID: reqData?.orderID ,
        orderType: reqData?.type === 'reject' ? 'Reject' : 'Cancel',
        cancelReason: values?.reason
    }

    Swal.fire({
        title: `Are you sure you want to ${reqData?.type === 'reject' ? 'reject' : 'cancel'} this customization request?`,
        text: "These changes cannot be revoked",
        icon: "question",
        showCancelButton: true,
        cancelButtonText: 'No',
        confirmButtonColor: '#414a4c',
        confirmButtonText: "Yes",

    }).then((result) => {
        if (result.isConfirmed) {
            try {
                axiosClient.post('custom/updateRequest', orderData)
                  .then(({ data }) => {
                    toast.success(`${data.message}`, {
                      position: "top-right",
                      autoClose: 2000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "colored",
                      transition: Bounce,
                      style: { fontFamily: 'Kanit', fontSize: '16px' }
                    });

                    fetchOrders()
                    onClose()

                  })
          
            } catch (error) {
              console.log(error);
            }


        }
    });
    
  }

  return (
    <div>
      <Dialog open={open} onClose={onClose} style={{ zIndex: zIndex }}>
      <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 29 }}>
                {reqData?.type === 'reject' ? 'REJECT' : 'CANCEL'} CUSTOMIZATION REQUEST
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <DialogContent >
        <Formik
          initialValues={{ reason: ''}}
          validationSchema={reasonValidationSchema}
          onSubmit={(values, { setSubmitting }) => {

            updateOrd(values)
            setSubmitting(false);

          }}
        >
          {({ isSubmitting, isValid }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                <Typography sx={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 400, color: 'black', marginBottom: '8px' }}>
                    Kindly indicate the reason why you are {reqData?.type === 'reject' ? 'rejecting' : 'cancelling'} this customization request, <b>this will reflect on the users order table.</b>
                </Typography>
                    <Field name="reason">
                        {({ field, meta }) => (
                            <TextField
                                {...field}
                                id="reason"
                                label="Reason"
                                fullWidth
                                multiline
                                rows={2}
                                InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                                inputProps={{ style: { fontSize: 16, fontFamily: 'Kanit' }}}
                                variant="outlined"
                                error={meta.touched && meta.error}
                                helperText={meta.touched && meta.error}
                                sx={{ width: '100%', fontFamily: 'Inter' }}
                            />
                        )}
                    </Field>
                </Grid>
              </Grid>
              <DialogActions>
                <Button  type = 'submit' color="primary" disabled={isSubmitting || !isValid}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black'}}>
                    PROCEED
                  </Typography>
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RejectOrder