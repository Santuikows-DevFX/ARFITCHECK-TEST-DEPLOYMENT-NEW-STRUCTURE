import React, { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,MenuItem, TextField, Box, IconButton, Divider, FormHelperText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {  OutlinedButton } from '../UI/Buttons';
import StyledTextFields from '../UI/TextFields';
import axiosClient from '../../axios-client';
import { useDropzone } from 'react-dropzone';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import Close from '@mui/icons-material/Close';

const AddProduct= ({ open, onClose, fetchProducts }) => {

  const ProductValidationSchema = Yup.object().shape({
    productName: Yup.string().required('Product Name is required'),
    price: Yup.number().required('Price is required'),
    criticalLevelQuantity: Yup.number()
        .required('Critical Level Qnt is required')
        .min(0, 'Critical Level Qnt cannot be less than 0'),
    category: Yup.string().required('Category is required'),
    description: Yup.string().optional(),
    smallQuantity: Yup.number()
        .min(0, 'Small Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
    mediumQuantity: Yup.number()
        .min(0, 'Medium Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
    largeQuantity: Yup.number()
        .min(0, 'Large Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
    extraLargeQuantity: Yup.number()
        .min(0, 'Extra Large Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
    doubleXLQuantity: Yup.number()
        .min(0, 'Double XL Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
    tripleXLQuantity: Yup.number()
        .min(0, 'Triple XL Quantity cannot be less than 0')
        .max(5000, 'Please input a much more realistic quantity.'),
  });


 const ProductValidationSchemaIfCaps = Yup.object().shape({
  productName: Yup.string().required('Product Name is required'),
  price: Yup.number().required('Price is required'),
  criticalLevelQuantity: Yup.number()
      .required('Critical Level Qnt is required')
      .min(0, 'Critical Level Qnt cannot be less than 0'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().optional(),
  totalQuantity: Yup.number()
      .min(0, 'Total Quantity cannot be less than 0')
      .max(5000, 'Please input a much more realistic quantity.'),
 });

  const categoryOptions = [
    'Hoodies',
    'T-Shirt',
    'Shorts',
    'Caps',
  ];
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [files, setFiles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleAddProduct = (values) => {
    try {

     if (files.length !== 3) {
      toast.error('Please upload 3 images of the product.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
        style: { fontFamily: 'Kanit', fontSize: '16px' }
      });

     }else {
      const productVal = new FormData();
      productVal.append('productName', values.productName)
      productVal.append('productPrice', values.price)
      productVal.append('productCategory', values.category)
      productVal.append('productDescription', values.description)
      productVal.append('productCriticalLevelQuantity', values.criticalLevelQuantity)
      productVal.append('smallQuantity', values.smallQuantity)
      productVal.append('mediumQuantity', values.mediumQuantity)
      productVal.append('largeQuantity', values.largeQuantity)
      productVal.append('extraLargeQuantity', values.extraLargeQuantity)
      productVal.append('doubleXLQuantity', values.doubleXLQuantity)
      productVal.append('tripleXLQuantity', values.tripleXLQuantity)
      productVal.append('totalQuantity', values.totalQuantity);

      files.forEach((file, index) => {
        if (file) {
          productVal.append(`productFile${index + 1}`, file); 
        }
      });

      axiosClient.post('prd/insertProducts', productVal)
      .then(({data}) => {
        
        if(data.message === 'Product Added!') {
          
          toast.success(`${data.message}`, {
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
         
         setFiles([])
         onClose()
         fetchProducts()

        }else {
          toast.error(`${data.message}`, {
            position: "top-right",
            autoClose: 2500,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            transition: Bounce,
            style: { fontFamily: 'Kanit', fontSize: '16px' }
         });
        }
      })
     }
  
    } catch (error) {
      console.log(error);
    }
  };
  
  const onDrop = (acceptedFiles) => {
    const validFiles = acceptedFiles.filter(
      (file) =>
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/jpg'
    );
    //what this do is combine all the prev uploaded images to the current files being uploaded so the validation will not be trigerred when deleting an image and uploading again.
    const totalFiles = validFiles.length + files.length; 
  
    if (validFiles.length > 0 && totalFiles <= 3) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]); 
    } else if (totalFiles > 3) {
      toast.error('Maximum of 3 images only!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'colored',
        transition: Bounce,
        style: { fontFamily: 'Kanit', fontSize: '16px' }
      });
    }
  };
  
  const handleRemoveImage = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    setFiles(updatedFiles);
  };
  
  const handleChangeCategory = (category) => {
    setSelectedCategory(category)
  }
 
  const handleChooseFileClick = () => {
    setIsImageDialogOpen(true)
  };

  const handleImageDialogClose = () => {
    setIsImageDialogOpen(false)
  }

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: 'image/jpeg, image/png' });

  return (
    <div>
      <Dialog open={open} onClose={onClose} >
        <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                ADD PRODUCT IN INVENTORY
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <DialogContent >
        <Formik
        initialValues={{ productName: '', price: '',description : '', criticalLevelQuantity: '0', category: '', smallQuantity: '0', mediumQuantity: '0', largeQuantity: '0', extraLargeQuantity: '0', doubleXLQuantity: '0', tripleXLQuantity: '0', totalQuantity: '0' }}
        validationSchema={selectedCategory === 'Caps' ? ProductValidationSchemaIfCaps : ProductValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddProduct(values)
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, values, isValid }) => (
          <Form>
            <Grid container spacing={2} sx={{ pb: "1vh" }}>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center">
                  <Grid item sx={{ textAlign: 'center' }}>
                    <Box
                      {...getRootProps()}
                      sx={{
                        width: 200,
                        height: 200,
                        border: '2px dashed',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <input {...getInputProps()} />
                      {files.length > 0 ? (
                        <img
                          src={URL.createObjectURL(files[0])}
                          alt="Uploaded"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <IconButton color="black" aria-label="upload picture" component="span" disabled = {true}>
                          <AddIcon fontSize="large"  />
                        </IconButton>
                      )}
                    </Box>
                  </Grid>
                  <Grid item sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: 400 }}>
                    {[1, 2].map((index) => (
                      <Box
                        key={index}
                        {...getRootProps()}
                        sx={{
                          width: 120,
                          height: 120,
                          border: '2px dashed',
                          borderRadius: '4px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginX: 1,
                        }}
                      >
                        <input {...getInputProps()} />
                        {files[index] ? (
                          <img
                            src={URL.createObjectURL(files[index])}
                            alt="Uploaded"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <IconButton color="black" aria-label="upload picture" component="span" disabled = {true}>
                            <AddIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                  </Grid>
                  <Grid item alignSelf="center">
                    <OutlinedButton onClick={handleChooseFileClick}>{files.length > 0 ? 'EDIT IMAGES' : 'UPLOAD IMAGES'}</OutlinedButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field name="productName">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="productName" label="Product Name" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="price">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="price" label="Price" type="number" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="criticalLevelQuantity">
                      {({ field, meta }) => (
                        <StyledTextFields field={field} meta={meta} id="criticalLevelQuantity" label="Critical Level Quantity" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="category">
                      {({ field, meta }) => (
                        <TextField
                          {...field}
                          select
                          label="Category"
                          variant="filled"
                          fullWidth
                          error={meta.touched && meta.error}
                          InputLabelProps={{ 
                            sx: { fontFamily: 'Kanit', fontSize: 20 }
                          }}
                          helperText={
                            meta.touched && meta.error ? (
                              <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red', fontWeight: 500 }}>
                                {meta.error}
                              </FormHelperText>
                            ) : ''
                          }
                        >
                          {categoryOptions.map((option) => (
                            <MenuItem key={option} value={option} onClick={() => handleChangeCategory(option)}>
                              <Typography sx={{ fontFamily: 'Kanit', fontSize: 16, fontWeight: 'medium', color: 'black' }}>
                                {option}
                              </Typography>
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* QUANTITY & DESCRIPTION */}
           {values.category !== 'Caps' ? (
             <Grid container spacing={2}>
             <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 30, fontWeight: 'medium', color: 'black' }}>
                   Sizes
                 </Typography>
               </Grid>
               <Grid item xs={8}>
               <Typography sx={{ fontFamily: 'Kanit', fontSize: 30, fontWeight: 'medium', color: 'black' }}>
                   Quantity 
                 </Typography>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   Small
                 </Typography>
               </Grid>
               <Grid item xs={8}>
                 <Field name="smallQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="smallQuantity" label="Quantity" type= 'number'/>
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   Medium
                 </Typography>
               </Grid>
               <Grid item xs={8}>
                 <Field name="mediumQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="mediumQuantity" label="Quantity" type= 'number'/>
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   Large
                 </Typography>
               </Grid>
               <Grid item xs={8}>
                 <Field name="largeQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="largeQuantity" label="Quantity" type= 'number' />
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   Extra Large
                 </Typography>
               </Grid>
               <Grid item xs={8}>
               <Field name="extraLargeQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="extraLargeQuantity" label="Quantity" type= 'number' />
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   2XL
                 </Typography>
               </Grid>
               <Grid item xs={8}>
               <Field name="doubleXLQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="doubleXLQuantity" label="Quantity" type= 'number' />
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12}>
             <Grid container spacing={2} alignItems="center">
               <Grid item xs={4}>
                 <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                   3XL
                 </Typography>
               </Grid>
               <Grid item xs={8}>
               <Field name="tripleXLQuantity">
                   {({ field, meta }) => (
                     <StyledTextFields field={field} meta={meta} id="tripleXLQuantity" label="Quantity" type= 'number' />
                   )}
                 </Field>
               </Grid>
             </Grid>
           </Grid>
           <Grid item xs={12} sx={{ mt: 1 }}>
           <Field name="description">
               {({ field, meta }) => (
                 <StyledTextFields field={field} meta={meta} id="description" label="Description" />
               )}
             </Field>
           </Grid>
             </Grid>
           ) : (
            <Grid container spacing={2}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4} sx={{ mt: 1.5 }}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 30, fontWeight: 'medium', color: 'black' }}>
                    Quantity
                  </Typography>
                </Grid>
                <Grid item xs={12}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={4}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                    Total Quantity
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Field name="totalQuantity">
                    {({ field, meta }) => (
                      <StyledTextFields field={field} meta={meta} id="totalQuantity" label="Quantity" type= 'number'/>
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Field name="description">
                    {({ field, meta }) => (
                      <StyledTextFields field={field} meta={meta} id="description" label="Description" />
                    )}
                 </Field>
                </Grid>
              </Grid>
            </Grid>
              </Grid>
             </Grid>
           )}
          {/* image upload shit */}
          <Dialog open={isImageDialogOpen} onClose={handleImageDialogClose}>
            <DialogTitle>
              <Typography
                sx={{ fontFamily: 'Inter', fontSize: 25, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}
              >
                Upload Product Images
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderRadius: '4px',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'border-color 0.2s ease-in-out',
                  cursor: 'pointer'
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleImageDialogClose}>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: 'red' }}>
                  Close
                </Typography>
              </Button>
            </DialogActions>
          </Dialog>
          <DialogActions>
            <Button color="primary" disabled = {!files || isSubmitting || !isValid || values.productName.length === 0 || values.price.length === 0 || values.category.length === 0 || files.length !== 3} type='submit'>
            <Typography sx={{position: 'sticky', fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color: !files || isSubmitting || !isValid || values.productName.length === 0 || values.price.length === 0 || values.category.length === 0  || files.length !== 3? 'gray' : 'black' }}>
                Add
              </Typography>
            </Button>
          </DialogActions>
          </Form>
        )}
      </Formik>
        </DialogContent>
      </Dialog>
      <ToastContainer/>
    </div>
  );
};

export default AddProduct;