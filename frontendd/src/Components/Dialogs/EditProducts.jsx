import React, { useEffect, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Grid, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,MenuItem, TextField, Box, IconButton, Divider, FormHelperText, Checkbox, FormControlLabel } from '@mui/material';
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

const EditProducts = ({ open, onClose, product, productID, fetchProducts }) => {

  const [files, setFiles] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [productVisible, setProductVisible] = useState(!product.isVisible)

  const [editableCategory, setEditableCategory] = useState(false)

  //click handlers for fields WAG GAGALAWIN

  const handleProductCateogoryClick = () => {
    setEditableCategory(true)
  }

  // -------------------------------------------------

  useEffect(() => {

    if (!files.length) {

      const prdImages = [
        product?.productImage,
        product?.productImage1,
        product?.productImage2,
      ];
  
      setFiles(prdImages.filter(image => image));
    }

  }, [product])

  const handleRemoveImage = (index) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    console.log(updatedFiles);
    
    setFiles(updatedFiles);
  };

  const handleProductVisibleChange = () => {

    if(productVisible === true){
      setProductVisible(false)

    }else {
    setProductVisible(true)

    }
  }

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

  const handleEditProduct = (values) => {
    try {

      editProduct(values)

    } catch (error) {
      console.log(error);
    }
  }

  const editProduct  = (values) => { 

    try {

      if (files.length !== 3) {
        toast.error('Please upload 3 product images.', {
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
      }else {
        const editProductVal = new FormData();
      
        editProductVal.append('productName', values.productName)
        editProductVal.append('productPrice', values.price)
        editProductVal.append('productCategory', values.category)
        editProductVal.append('productDescription', values.description)
        editProductVal.append('productCriticalLevelQuantity', parseInt(values.criticalLevelQuantity))
        editProductVal.append('isUnlisted', productVisible)
        editProductVal.append('totalQuantity', parseInt(values.totalQuantity))
        editProductVal.append('smallQuantity', parseInt(values.smallQuantity))
        editProductVal.append('mediumQuantity', parseInt(values.mediumQuantity))
        editProductVal.append('largeQuantity', parseInt(values.largeQuantity))
        editProductVal.append('extraLargeQuantity', parseInt(values.extraLargeQuantity))
        editProductVal.append('productID', productID)
  
        files.forEach((file, index) => {
          if (file) {
            editProductVal.append(`productFile${index + 1}`, file); 
          }
        });

        axiosClient.post('prd/editProduct', editProductVal)
        .then(({data}) => {
          
          if(data.message === 'Product Updated!') {
  
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
              onClose: () => {
                onClose()
              },
              style: { fontFamily: 'Kanit', fontSize: '16px' }
            });
  
          }
          
        })
      }
      
    } catch (error) {
      console.log(error);
    }

  }

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
                EDIT PRODUCT IN INVENTORY
            </Typography>
            <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
        </DialogTitle> 
        <DialogContent >
        <Formik
        initialValues={{ productName: product?.productName || '', price:product?.productPrice || '',description : product?.productDescription || '', criticalLevelQuantity: product?.productCriticalLevel || '', category:  product?.productCategory || '', smallQuantity: product?.smallQuantity || '0', mediumQuantity: product?.mediumQuantity || '0', largeQuantity: product?.largeQuantity || '0', extraLargeQuantity: product?.extraLargeQuantity || '0',  doubleXLQuantity: product?.doubleXLQuantity || '0', tripleXLQuantity: product?.tripleXLQuantity || '0', productVisible: product?.isVisible, totalQuantity: '0' }}
        validationSchema={product?.productCategory === 'Caps' ? ProductValidationSchemaIfCaps : ProductValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleEditProduct(values)
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, values, submitForm, isValid }) => (
          <Form>
            <Grid container spacing={2} sx={{pb: "1vh"}}>
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
                      {files.length > 0  ? (
                        files[0] ? (
                          <img
                          src={(typeof files[0] === 'string' ? files[0] : URL.createObjectURL(files[0]))}
                          alt="Uploaded"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        ) : (
                          <Typography></Typography>
                        )
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
                            src={(typeof files[index] === 'string' ? files[index] : URL.createObjectURL(files[index]))}

                            alt="Product"
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
                    <OutlinedButton onClick={handleChooseFileClick}>EDIT IMAGES</OutlinedButton>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Field name="productName">
                      {({ field, meta }) => (
                        <StyledTextFields 
                        field={{ 
                          ...field, 
                          onChange: (e) => field.onChange(e),
                        }} 
                        meta={meta} 
                        id="productName" 
                        label="Product Name" />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                    <Field name="price">
                      {({ field, meta }) => (
                        <StyledTextFields 
                        field={{ 
                            ...field,
                            onChange: (e) => field.onChange(e),
                          }} 
                        meta={meta} 
                        id="price" 
                        label="Price" 
                        type= 'number'/>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12}>
                  <Field name="criticalLevelQuantity">
                    {({ field, meta }) => (
                      <StyledTextFields 
                      field={{ 
                        ...field,
                        onChange: (e) => field.onChange(e),
                      }} 
                      meta={meta} 
                      id="criticalLevelQuantity" 
                      label="Critical Level Quantity"
                      type='number'
                       />
                      
                    )}
                  </Field>
                </Grid>
                  <Grid item xs={12}>
                  <Field name="category">
                    {({ field, meta }) => (
                      <TextField
                        {...field}
                        InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                        select
                        label="Category"
                        variant="filled"
                        fullWidth
                        error={meta.touched && meta.error}
                        value={editableCategory ? field.value : `${product.productCategory}`}
                        onChange={(e) => {
                          field.onChange(e);
                          setEditableCategory(false);
                        }}
                        onClick={handleProductCateogoryClick}
                        helperText={meta.touched && meta.error ? (
                          <FormHelperText sx={{ fontFamily: 'Kanit', fontSize: 14, color: 'red', fontWeight: 500, textAlign: 'left' }}>
                            {meta.error}
                          </FormHelperText>
                        ) : ''}
                      >
                        {categoryOptions.map((option) => (
                          <MenuItem key={option} value={option} onClick={() => {
                            field.onChange(option); 
                            setEditableCategory(false); 
                          }}>
                            <Typography sx={{ fontFamily: 'Kanit', fontSize: 18, fontWeight: 'medium', color: 'black' }}>
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
                  Quantity <span style={{ opacity: 0.5, font: 'Inter'}}>({product.productQuantity})</span>
                </Typography>
              </Grid>
            </Grid>
            </Grid>
            {product?.productCategory !== 'Caps' ? (
             <Grid container spacing={2}>
               <Grid item xs={12}>
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
              <Grid item xs={12}>
                <Field name="productVisible">
                  {({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={productVisible} onChange={handleProductVisibleChange} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}/>}
                      label={<Typography sx={{ fontSize: 16, fontFamily: 'Inter' }}>{productVisible === true ? 'List this product' : 'Unlist this product'}</Typography>}
                      sx={{ fontSize: '10px' }}
                    />
                  )}
                </Field>
              </Grid>
              </Grid>
              ) : (
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={4}>
                    <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                      Add Quantity
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
                      <Grid item xs={12}>
                        <Field name="productVisible">
                          {({ field }) => (
                            <FormControlLabel
                              control={<Checkbox {...field} checked={productVisible} onChange={handleProductVisibleChange} sx={{ '& .MuiSvgIcon-root': { fontSize: 18 } }}/>}
                              label={<Typography sx={{ fontSize: 16, fontFamily: 'Kanit' }}>{productVisible === true ? 'List this product' : 'Unlist this product'}</Typography>}
                              sx={{ fontSize: '10px' }}
                            />
                          )}
                        </Field>
                      </Grid>
                </Grid>
           )}
            </Grid>
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
                        {files.map((image, index) => (
                          <Grid item key={index} sx={{ textAlign: 'center' }}>
                            <Avatar
                              sx={{
                                width: 100,
                                height: 100,
                                borderRadius: '4px',
                                marginBottom: 1,
                              }}
                              alt={`Product ${index + 1}`}
                              src={(typeof files[index] === 'string' ? files[index] : URL.createObjectURL(files[index]))}

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
            <DialogActions style={{ bottom: 0, backgroundColor: 'white', zIndex: 1000 }}>
              <Button color="primary" onClick={() => submitForm()} disabled = {!files || isSubmitting || !isValid || values.productName.length === 0 || values.price.length === 0 || values.category.length === 0  }>
                <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: '350', color:!files || isSubmitting || !isValid || values.productName.length === 0 || values.price.length === 0 || values.category.length === 0 ? 'gray' : 'black' }}>
                  Edit
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

export default EditProducts