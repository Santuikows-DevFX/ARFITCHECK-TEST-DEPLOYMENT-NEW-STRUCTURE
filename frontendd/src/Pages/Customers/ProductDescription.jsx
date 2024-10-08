import React, { useEffect, useState } from 'react';
import { Typography, Grid, Rating, Select, MenuItem, IconButton, Box, Button, CircularProgress } from '@mui/material';
import Slider from 'react-slick';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import StyledTextFields from '../../Components/UI/TextFields';
import axiosClient from '../../axios-client';
import CloseIcon from '@mui/icons-material/Close';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

import { useCookies } from 'react-cookie';
import { useCart } from '../../ContextAPI/CartProvider';
import Sizes from '../../Components/Dialogs/Sizes';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function ProductDescription({ product, onClose }) {

    const { productName, productDescription, productImage, productPrice, productCategory, productQuantity, smallQuantity, mediumQuantity, largeQuantity, extraLargeQuantity, doubleXLQuantity, tripleXLQuantity, productRating } = product;

    const [selectedSize, setSelectedSize] = useState('');
    const [cookie, removeCookie] = useCookies(['?id'])
    const [sizeStock, setSizeStock] = useState('')
    const [modalOpen, setModalOpen] = useState(false);
    const [addToCartLoading, setAddToCartLoading] = useState(false);

    const {addToCart} = useCart();

    const availableSizes = [
        { size: 'S', quantity: smallQuantity },
        { size: 'M', quantity: mediumQuantity },
        { size: 'L', quantity: largeQuantity },
        { size: 'XL', quantity: extraLargeQuantity },
        { size: '2XL', quantity: doubleXLQuantity },
        { size: '3XL', quantity: tripleXLQuantity },
    ];

    const productImages = [
        product?.productImage,
        product?.productImage1,
        product?.productImage2,
    ].filter(image => image); 

    useEffect(() => {
        const firstAvailableSize = availableSizes.find(item => item.quantity > 0);
        if (firstAvailableSize) {
            setSelectedSize(firstAvailableSize.size);
            setSizeStock(firstAvailableSize.quantity)
        }
    }, [smallQuantity, mediumQuantity, largeQuantity, extraLargeQuantity, doubleXLQuantity, tripleXLQuantity]);


    const CartValidationSchema = Yup.object().shape({
        quantity: Yup.number()
        .min(1, 'Quantity cannot be less than 1')
        .max(sizeStock, `Quantity cannot exceed available stock of ${sizeStock}`)
        .required('Product quantity is required'),
    });

    const CartValidationSchemaIfCaps = Yup.object().shape({
        quantity: Yup.number()
        .min(1, 'Quantity cannot be less than 1')
        .max(productQuantity, `Quantity cannot exceed available stock of ${productQuantity}`)
        .required('Product quantity is required'),
    });

    const handleSizeChange = (event) => {
        const selectedSizeValue = event.target.value;
        setSelectedSize(selectedSizeValue);
    
        if (selectedSizeValue === 'S') {
            setSizeStock(smallQuantity)
        } else if (selectedSizeValue === 'M') {
            setSizeStock(mediumQuantity)
        }else if(selectedSizeValue === 'L') {
            setSizeStock(largeQuantity)
        }else if (selectedSizeValue === 'XL') {
            setSizeStock(extraLargeQuantity)
        }else if (selectedSizeValue === '2XL') {
            setSizeStock(doubleXLQuantity)
        }else if (selectedSizeValue === '3XL') {
            setSizeStock(tripleXLQuantity)
        }
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleProductClick = () => {
        setModalOpen(true);

    };
    const insertCart = async (values) => {

        const cartValue = { 
  
            productImage: product?.productImage,
            productName: product?.productName,
            productSize: selectedSize,
            productCategory: product?.productCategory,
            productPrice: product?.productPrice,
            productQuantity: values.quantity,
            maximumQuantity: sizeStock,

            uid: cookie['?id']
      
        }
        try {

          if(values.quantity <= 0) {

            toast.error('Quantity cannot be less than 1', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                transition: Bounce,
                style: { fontFamily: 'Kanit', fontSize: '16px' }
            });

          }else if(values.quantity >= productQuantity) {

            toast.error('Quantity is too large compared to stock', {
                position: "top-right",
                autoClose: 5000,
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

            setAddToCartLoading(true)

             await axiosClient.post('cart/insertCartItems', cartValue)
            .then(({data}) => {
                
                if(data.message === "Added to Cart!") {

                    toast.success(`${data.message}`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        transition: Bounce,
                        style: { fontFamily: 'Kanit', fontSize: '16px' }
                    });

                    addToCart(cartValue)
                    setAddToCartLoading(false)

                }else {
                    toast.error(`${data.message}`, {
                        position: "top-right",
                        autoClose: 5000,
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

        }catch(error) {
            console.log(error);
        } 

    }

    const openImageInNewTab = (imageUrl) => {
        window.open(imageUrl, '_blank');
    };

    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: "linear",
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
        <Formik
            initialValues={{ quantity: '1', size: '' }}
            validationSchema={productCategory === 'Caps' ? CartValidationSchemaIfCaps : CartValidationSchema}
            onSubmit={(values, { setSubmitting }) => {
                insertCart(values);
                setSubmitting(false);
            }}
        >
            {({ isSubmitting, isValid }) => (
                <Form>
                    <Grid container>
                    <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', top: 0, right: 0 }}>
                        <CloseIcon />
                    </IconButton>
                        <Grid item xs={12} md={4} sx={{ background: 'linear-gradient(to left, #414141  , #000000)', height: { xs: '50vh', md: '95vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <Slider {...settings} style={{ height: 'auto', width: '90%'}}>
                            {productImages.map((image, index) => (
                                <div key={index} style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                                    <img
                                        src={image}
                                        alt={`Product Image ${index + 1}`}
                                        style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '90%',  
                                            aspectRatio: '1/1',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            boxShadow: '10px 10px 10px rgba(0, 0, 0, 0.3)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => openImageInNewTab(image)}
                                    />
                                </div>
                            ))}
                        </Slider>
                        </Grid>
                        <Grid item xs={12} md={8} sx={{ backgroundColor: '#F5F7F8' }}>
                            <Box sx={{ mx: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 25, md: 50 }, fontWeight: 'bold', color: 'black' }}>
                                    {productName}
                                </Typography>
                            </Box>
                            <Box sx={{ mx: 3 }}>
                                <Rating 
                                    name="product-rating"
                                    value={productRating}
                                    emptyIcon={<StarBorderIcon style={{ color: 'linear-gradient(to right, #FABC3C , #FACC6B)' }} sx ={{fontSize: { xs: 12, md: 30 }}}/>}
                                    icon={<StarIcon style={{ color: 'linear-gradient(to right, #FABC3C , #FACC6B)', }}sx ={{fontSize: { xs: 12, md: 30 }}} />}
                                    readOnly
                                />
                                <Grid container direction="column" spacing={2} sx={{ pb: '5%' }}>
                                    <Grid item container justifyContent="space-between" alignItems="center">
                                        <Grid item xs={12} sm={6}>
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 30 }, fontWeight: 'bold', color: 'black' }}>
                                                Price: <b>₱{productPrice}.00</b>
                                            </Typography> 
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 22 }, fontWeight: 400, color: 'black' }}>
                                                Category: <span style={{ fontWeight: 'bold' }}><b>{productCategory.toUpperCase()}</b></span>
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 22 }, fontWeight: 400, color: 'black' }}>
                                                Availability: 
                                                <span style={{ fontWeight:'bold', color: productQuantity > 0 ? 'green' : 'red' }}>
                                                    <b> {productQuantity > 0 ? 'IN STOCK' : 'Out of stock'}</b>
                                                </span>
                                            </Typography>
                                            {productCategory === 'Caps' ? (
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 22 }, fontWeight: 400, color: 'black' }}>
                                                  Stock: <span style={{ fontWeight: 'bold' }}><b>{productQuantity}</b></span>
                                                </Typography>
                                            ) : (
                                               <>
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 22 }, fontWeight: 400, color: 'black' }}>
                                                  Size Stock: <span style={{ fontWeight: 'bold' }}><b>{sizeStock ? sizeStock : 0}</b></span>
                                                </Typography>
                                               </>
                                            )}
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 12, md: 35 }, fontWeight: 'bold', color: 'black'}}>
                                                PRODUCT DESCRIPTION:
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'Inter', fontSize: { xs: 12, md: 24 }, fontWeight: 'regular', color: 'black', pb: '5%' }}>
                                                {productDescription}
                                            </Typography>
                                       </Grid>
                                        {productCategory === 'Caps' ? (
                                            <>
                                            <Grid container sx={{ width: { xs: '100%', sm: '100%' }, justifyContent: 'center', alignItems: 'center' }}>
                                                <Field name="quantity">
                                                    {({ field, meta }) => (
                                                        <StyledTextFields
                                                    
                                                            field={field}
                                                            meta={meta}
                                                            id="quantity"
                                                            label="Quantity"
                                                            type="number"
                                                        />
                                                    )}
                                                </Field>
                                            </Grid>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                disabled={isSubmitting || !isValid}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                                                    '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                                                    mb: 3,
                                                    mt: 2,
                                                    opacity: (isSubmitting || !isValid) ? 0.5 : 1,
                                                    cursor: (isSubmitting || !isValid) ? 'not-allowed' : 'pointer',
                                                    background: 'linear-gradient(to right, #414141  , #000000)'
                                                }}
                                            >
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 25 }, p: 0.5, visibility: addToCartLoading ? 'hidden' : 'visible'}}>ADD TO CART</Typography>
                                                {addToCartLoading && (
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
                                            </>
                                        ) : (
                                         <>
                                            <Button
                                                onClick={handleProductClick}
                                                    fullWidth
                                                    variant="outlined"
                                                    sx={{
                                                        mb: 3,
                                                    
                                                        color: 'black',
                                                        borderColor: 'black',
                                                        opacity: (isSubmitting || !isValid) ? 0.5 : 1,
                                                        cursor: (isSubmitting || !isValid) ? 'not-allowed' : 'pointer',
                                                        '&:hover': {
                                                            borderColor: 'black', 
                                                        },
                                                    }}
                                            >
                                            <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 25 }, p: 0.5, color: 'black' }}>SIZE CHART</Typography>
                                            </Button>
                                            <Grid container sx={{ width: { xs: '100%', sm: '100%' }, justifyContent: 'center', alignItems: 'center' }}>
                                                <Field name="size">
                                                    {({ field, meta }) => (
                                                    <Select
                                                        {...field}
                                                        fullWidth
                                                        variant="outlined"
                                                        inputProps={{ style: { color: 'black' } }}
                                                        value={selectedSize}
                                                        onChange={handleSizeChange}
                                                        sx = {{mb: 2}}
                                                    >
                                                        <MenuItem value="S" disabled={smallQuantity <= 0}>
                                                            {smallQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    S
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    S - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem value="M" disabled={mediumQuantity <= 0}>
                                                            {mediumQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    M
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    M - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem value="L" disabled={largeQuantity <= 0}>
                                                            {largeQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    L
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    L - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem value="XL" disabled={extraLargeQuantity <= 0}>
                                                            {extraLargeQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    XL
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    XL - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem value="2XL" disabled={doubleXLQuantity <= 0}>
                                                            {doubleXLQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    2XL
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    2XL - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                        <MenuItem value="3XL" disabled={tripleXLQuantity <= 0}>
                                                            {tripleXLQuantity > 0 ? (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    3XL
                                                                </Typography>
                                                            ) : (
                                                                <Typography sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: 20 } }}>
                                                                    3XL - <span style={{ color: 'red', fontWeight: 'bold' }}>Out of stock</span>
                                                                </Typography>
                                                            )}
                                                        </MenuItem>
                                                    </Select>
                                                )}
                                                </Field>
                                                <Field name="quantity">
                                                    {({ field, meta }) => (
                                                        <StyledTextFields
                                                    
                                                            field={field}
                                                            meta={meta}
                                                            id="quantity"
                                                            label="Quantity"
                                                            type="number"
                                                        />
                                                    )}
                                                </Field>
                                            </Grid>
                                            <Button
                                                type="submit"
                                                fullWidth
                                                variant="contained"
                                                disabled={isSubmitting || !isValid}
                                                sx={{
                                                    backgroundColor: 'white',
                                                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                                                    '&:not(:hover)': { backgroundColor: '#3d4242', color: 'white' },
                                                    mb: 3,
                                                    mt: 2,
                                                    opacity: (isSubmitting || !isValid) ? 0.5 : 1,
                                                    cursor: (isSubmitting || !isValid) ? 'not-allowed' : 'pointer',
                                                    background: 'linear-gradient(to right, #414141  , #000000)'
                                                }}
                                            >
                                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 20, md: 25 }, p: 0.5, visibility: addToCartLoading ? 'hidden' : 'visible'}}>ADD TO CART</Typography>
                                                {addToCartLoading && (
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
                                         </>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik>
        <Sizes onClose={handleCloseModal} open={modalOpen} category={productCategory}/>
        <ToastContainer />
    </div>
    );
}

export default ProductDescription;