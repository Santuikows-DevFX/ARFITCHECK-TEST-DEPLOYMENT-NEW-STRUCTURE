import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, TextField, Box, IconButton, Grid, Divider, Select, MenuItem, Backdrop, CircularProgress, Avatar } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSnackbar } from 'notistack';
import testImage from '../../../public/assets/bmicHomePage.png'
import testImage1 from '../../../public/assets/comingSoonImage.png'
import sampleReceiptImage from '../../../public/assets/sampleReceiptImage.png'
import sampleImageProb1 from '../../../public/assets/sampleImage1.png'
import sampleImageProb2 from '../../../public/assets/sampleImage2.png'
import axiosClient from '../../axios-client';

const ReturnProducts = ({ open, onClose, orderID, product }) => {
    
  const [files, setFiles] = useState([]);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    if (files.length > 3) {
      enqueueSnackbar('Maximum of 3 images only!', { variant: 'error' });
      setFiles(files.slice(0, 3)); 
    }
  }, [files]);

  const reasonValidationSchema = Yup.object().shape({
    reason: Yup.string().required('Reason is required'),
    additionalInfo: Yup.string(),
  });

  const returnReasons = [
    'Damaged Item',
    'Received Wrong Item',
    'Missing part of the Order',
    'Changed Mind',
    'Product Not as Described',
  ];

  const referenceImages = [
    { image: sampleReceiptImage }, 
    { image: sampleImageProb1 },
    { image: sampleImageProb2 },
  ];
  
  const onDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(
      (file) => file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
    );
    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  const handleSubmitReturnRequest = (values) => {

    try {

        setReturnLoading(true)

        if (files.length !== 3) {
            enqueueSnackbar(`Please upload 3 images of the product.`, { 
              variant: 'error',
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'right'
              },
              autoHideDuration: 2300,
              style: {
                fontFamily: 'Kanit',
                fontSize: '16px'
              },
              
            });
      
            setReturnLoading(false)
        }else {
            const productVal = new FormData();
            productVal.append('orderID', orderID)
            productVal.append('associatedOrderID', orderID)
            productVal.append('reason', values.reason)
            productVal.append('additionalInformation', values.additionalInfo)

            files.forEach((file, index) => {
                if (file) {
                 productVal.append(`productFile${index + 1}`, file); 
                }
            });

            axiosClient.post('order/returnProductRequest', productVal)
            .then(({data}) => {
                
                if(data.message === 'Return Request Sent! It will be processed within 2-3 business days.') {
                
                    enqueueSnackbar(`${data.message}`, { 
                        variant: 'success',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        autoHideDuration: 2300,
                        style: {
                            fontFamily: 'Kanit',
                            fontSize: '16px'
                        },
                    
                    });
                    
                    setFiles([])
                    onClose()
                    setReturnLoading(false);

                }else {
                    enqueueSnackbar(`${data.message}`, { 
                        variant: 'error',
                        anchorOrigin: {
                            vertical: 'top',
                            horizontal: 'right'
                        },
                        autoHideDuration: 2300,
                        style: {
                            fontFamily: 'Kanit',
                            fontSize: '16px'
                        },
                    
                    });
                    setReturnLoading(false);
                }
            })
        }
            
    } catch (error) {
        console.log(error);
        setReturnLoading(false);
    }
  } 

  const handleRemoveImage = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/jpeg, image/png' });

  return (
    <div>
      {returnLoading && (
        <Backdrop open={true} style={{ zIndex: 2000 + 1 }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100%', backdropFilter: 'blur(2px)' }}>
            <CircularProgress size={60} sx={{ color: 'white' }} />
          </div>
        </Backdrop>
      )}
      <Dialog open={open} onClose={onClose}>
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141, #000000)', color: 'white' }}>
          <Typography sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
            RETURNING ORDER
          </Typography>
        </DialogTitle>
        <DialogContent>
        <Formik
          initialValues={{ reason: '', additionalInfo: '' }}
          validationSchema={reasonValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmitReturnRequest(values)
            setSubmitting(false);
          }}
        >
          {({ isSubmitting, isValid, values }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: {xs: 16, md: 22}, fontWeight: 400, color: 'black', mt: 2 }}>
                    <span style={{ fontWeight: 'bold' }}>Returning Order: </span> {orderID} <br />
                    <span style={{ fontWeight: 'bold' }}>Product: </span> {product?.productName} <br />
                    <span style={{ fontWeight: 'bold' }}>Amount: </span> ₱{parseInt(product?.amountToPay).toFixed(2)}
                  </Typography>
                    <Divider sx={{ backgroundColor: 'black', mt: 1, mb: 2 }}/> 
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 400, color: 'black', marginBottom: 2, mt: 1 }}>
                    Kindly select the reason why do you want return this product. 
                  </Typography>
                  <Field name="reason">
                    {({ field, meta }) => (
                      <Select
                        id='reason'
                        {...field}
                        fullWidth
                        variant="outlined"
                        error={meta.touched && meta.error}
                        displayEmpty
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 15 } }}
                        inputProps={{ style: { fontSize: 13, fontFamily: 'Kanit' }}}
                        sx={{ width: '100%', fontFamily: 'Kanit', mb: 2 }}
                        helperText={meta.touched && meta.error}
                      >
                        <MenuItem value="" disabled sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 16} }}>
                          Select a reason
                        </MenuItem>
                        {returnReasons.map((reason, index) => (
                          <MenuItem key={index} value={reason} sx={{ fontFamily: 'Kanit', fontSize: {xs: 14, md: 16} }}>
                            {reason}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                </Grid>
              </Grid>
              <Divider sx={{ backgroundColor: 'black', mt: 1, mb: 1 }}/> 
              <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, mb: 2, mt: 2 }}>
                Kindly upload the image where the receipt is clear and visible. The image must also highlight the reason <span style={{ fontWeight: 'bold' }}>{values.reason || ''}</span> since this will serve as a evidence.
              </Typography>
                <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
                {referenceImages.map((item, index) => (
                    <Grid item xs={4} key={index} sx={{ textAlign: 'center' }}>
                    <Box
                        sx={{
                        border: '2px dashed gray',
                        borderRadius: '4px',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '150px',
                        }}
                    >
                        <img
                            src={item.image} 
                            alt={`Reference ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    </Box>
                    </Grid>
                ))}
                </Grid>
                <Divider sx={{ backgroundColor: 'black', mt: 1, mb: 1 }}/> 
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid container justifyContent="center" alignItems="center" sx={{ mt: { xs: 1, md: 4 } }}>
                   <Typography sx={{fontFamily: 'Kanit', fontSize: 14, color: 'red', mb: 1 }}>
                     ** Make sure the image is <span style={{ fontWeight: 'bold' }}>clear</span> and the receipt is <span style={{ fontWeight: 'bold' }}>visible</span>. **
                    </Typography>
                      <Box
                          {...getRootProps()}
                          sx={{
                              border: '2px dashed',
                              borderRadius: '4px',
                              padding: '20px',
                              textAlign: 'center',
                              transition: 'border-color 0.2s ease-in-out',
                              cursor: 'pointer',
                              width: '100%',
                              maxWidth: 400,
                          }}
                      >
                          <input {...getInputProps()} />
                          {files.length > 0 ? (
                              <>
                                  <Grid container spacing={2} justifyContent="center">
                                      {files.map((file, index) => (
                                          <Grid item key={index} sx={{ textAlign: 'center' }}>
                                              <Avatar
                                                  sx={{
                                                      width: 100,
                                                      height: 100,
                                                      borderRadius: '4px',
                                                      marginBottom: 1,
                                                  }}
                                                  alt={`Uploaded Image ${index + 1}`}
                                                  src={URL.createObjectURL(file)}
                                              />
                                              <IconButton
                                                  className="delete-button"
                                                  color="error"
                                                  onClick={() => handleRemoveImage(index)}
                                                  sx={{ fontSize: 12 }}
                                              >
                                                  <DeleteIcon fontSize="small" />
                                              </IconButton>
                                          </Grid>
                                      ))}
                                  </Grid>
                              </>
                          ) : (
                              <>
                                  <IconButton color="black" aria-label="upload picture" component="span">
                                      <CloudUploadIcon fontSize="large" />
                                  </IconButton>
                                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 300, color: 'black' }}>
                                      Click to Upload or Drag & Drop Here
                                  </Typography>
                              </>
                          )}
                          <Divider style={{ margin: '10px 0', width: '100%' }} />
                          <TextField
                              label="File Names"
                              variant="outlined"
                              fullWidth
                              size="small"
                              sx={{ marginBottom: '10px', fontFamily: 'Kanit' }}
                              InputLabelProps={{ sx: { fontFamily: 'Kanit' } }}
                              InputProps={{ sx: { fontFamily: 'Kanit', fontSize: 18 } }}
                              value={files.map((file) => file.name).join(', ')}
                              disabled
                          />
                      </Box>
                  </Grid>
              </Grid>
              <DialogActions>
                <Button type="submit" color="primary" disabled={isSubmitting || !isValid || values.reason.length === 0 || returnLoading || files.length != 3}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'black', opacity: isSubmitting || !isValid || values.reason.length === 0 || returnLoading || files.length != 3 ? 0.7 : 1 }}>
                    PROCEED
                  </Typography>
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
};

export default ReturnProducts;