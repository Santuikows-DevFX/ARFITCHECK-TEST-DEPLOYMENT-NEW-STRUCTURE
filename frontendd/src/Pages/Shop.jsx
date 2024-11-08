import React, { useEffect, useRef, useState } from 'react';
import { Grid, Card, CardContent, Typography, Dialog, Box, TextField, InputAdornment, IconButton, CardActionArea, CardMedia, Button, Rating, CircularProgress, Tabs, Tab, Pagination, FormHelperText, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

import Footer from '../Components/Footer';
import axiosClient from '../axios-client';
import ProductDescription from './Customers/ProductDescription';
import { useCookies } from 'react-cookie';
import PreLoader from '../Components/PreLoader';

import AOS from 'aos';
import 'aos/dist/aos.css'
import Navbar from '../WIdgets/Navbar';
import { useParams } from 'react-router-dom';

import allIcon from '../../public/assets/all.png'
import shirtIcon from '../../public/assets/shirt.png'
import shortIcon from '../../public/assets/short.png'
import capIcon from '../../public/assets/cap.png'
import hoodieIcon from '../../public/assets/hoodie.png'
import shopGraffitiBG from '../../public/assets/shopGraffiti1.png'
import { useSnackbar } from 'notistack';

AOS.init({
    duration: 600, 
    easing: 'ease-out-back', 
});

const styles = {
    root: {
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      
        backgroundImage: `url(${shopGraffitiBG})`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
    },
    searchBox: {
        marginTop: 20,
    },
    cardImage: {
        height: 200,
    },
    cardContent: {
        padding: '8px 16px',
    },
    modalContent: {
        padding: 20,
    }
};

function Shop() {

    document.documentElement.style.setProperty('--primary', 'black');

    const [headerText, setHeaderText] = useState('ALL PRODUCTS');
    const [cookie, remove, removeCookie, setCookie] = useCookies(['?role', '?priceFromMobile']);

    const [searchQuery, setSearchQuery] = useState('');
    const [noProductMessage, setNoProductMessage] = useState('');
    const [sortPrice, setSortPrice] = useState('');
    const [minPrice , setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')

    const [products, setProducts] = useState([]);   
    const [filteredSearchProducts, setFilteredSearchProducts] = useState([]);
    const [categoryCount, setCategoryCount] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
  
    const [loading, isLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const [isPriceFilter, setIsPriceFilter] = useState(false);
    const [applyFilterLoading, setApplyFilterLoading] = useState(false);
    const [categoryChoosingLoading, setCategoryChoosingLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const lastClickTimeRef = useRef(0);
    const { category } = useParams();

    const { enqueueSnackbar  } = useSnackbar();

    const COOLDOWN_TIME = 200;

    useEffect(() => {

        AOS.init();

        category === undefined ? fetchProducts() : fetchProductsByChosenCateg();
        setCurrentPage(1);
        
    }, [category]);

    useEffect(() => {
        if (sortPrice) {
            sortProducts(sortPrice);
        }

        setCurrentPage(1);

    }, [sortPrice, searchQuery]);

    const categories = [
        { name: 'All', icon: <img src={allIcon} alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalProduct},
        { name: 'T-shirts', icon: <img src={shirtIcon} alt='icon' style={{ width: '35px', height: '35px' }}/> ,count: categoryCount.totalTShirt },
        { name: 'Shorts', icon: <img src={shortIcon} alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalShorts },
        { name: 'Caps', icon: <img src={capIcon} alt='icon' style={{ width: '35px', height: '35px' }}/> , count: categoryCount.totalCaps},
        { name: 'Hoodies', icon: <img src={hoodieIcon} alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalHoodies},
    ];

    const sortProducts = (order) => {
        const sortedProducts = [...filteredSearchProducts].sort((a, b) => {
            const priceA = a.productInfo.productPrice;
            const priceB = b.productInfo.productPrice;
    
            return order === 'asc' ? priceA - priceB : priceB - priceA;
        });
    
        setFilteredSearchProducts(sortedProducts);
    };

    const fetchProductsByChosenCateg = async () => {
        try {

            isLoading(true);
            const productResponse = await axiosClient.get(`prd/fetchProductByCateg/${cookie['?role']}/${category}`);
            const categoryCountResponse = await axiosClient.get('prd/getCategoryCount');
            if (productResponse.data && categoryCountResponse.data) {
                isLoading(false);
                setProducts(productResponse.data);
                setFilteredSearchProducts(productResponse.data);
                setCategoryCount(categoryCountResponse.data);
                setSortPrice(null)
            }

        }catch(error) {

        }
    }

    const fetchProducts = async () => {
        try {
            isLoading(true);
            const productResponse = await axiosClient.get(`prd/getProducts/user`);
            const categoryCountResponse = await axiosClient.get('prd/getCategoryCount');

            if (productResponse.data && categoryCountResponse.data) {
                setNoProductMessage(0)
                isLoading(false);
                setProducts(productResponse.data);
                setFilteredSearchProducts(productResponse.data);
                setCategoryCount(categoryCountResponse.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleInputChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        if (query.length > 0) {
            const filtered = products.filter(product =>
                product.productInfo.productName.toLowerCase().includes(query.toLowerCase())
            );
            filtered.length > 0 ? setFilteredSearchProducts(filtered) : setNoProductMessage(1)
        } else {
            
            setFilteredSearchProducts(products);
            setNoProductMessage(0)
        }
    };

    const handleSearch = () => {
        const filteredProducts = products.filter(product =>
            product.productInfo.productName.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredSearchProducts(filteredProducts);
    };

    const handleProductClick = (product) => {
        setModalOpen(true);
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
    };

    const handleCategoryFilter = async (newHeaderText, count) => {
        const currentTime = new Date().getTime();
        setIsCooldown(true);
        setCurrentPage(1)

        if (currentTime - lastClickTimeRef.current < COOLDOWN_TIME) {
            enqueueSnackbar(`You might want to calm down a bit...`, { 
                variant: 'warning',
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
        }

        lastClickTimeRef.current = currentTime;

        if (newHeaderText === 'All') {
            newHeaderText = 'ALL PRODUCTS';
        }
        setHeaderText(newHeaderText.toUpperCase());

        try {
            const category = { category: newHeaderText };

            if(isPriceFilter) {

                const productData = { minimumPrice: parseInt(minPrice), maximumPrice: parseInt(maxPrice), category: newHeaderText };
                const response = newHeaderText === 'ALL PRODUCTS' ? 
                await axiosClient.post('prd/getProductByPriceRange', { minimumPrice: parseInt(minPrice), maximumPrice: parseInt(maxPrice) }) : 
                await axiosClient.post('prd/getProductByPriceAndCategory', productData);

                console.log(newHeaderText === 'ALL PRODUCTS' ? '' : productData);

                if (response.data) {
                    setNoProductMessage(0);
                    setProducts(response.data);
                    setFilteredSearchProducts(response.data);
                    setCategoryChoosingLoading(false)
                    setSortPrice(null)
                } else {
                    setNoProductMessage(1);
                    setCategoryChoosingLoading(false)
                    setSortPrice(null)
                }

            }else {

                const filteredProductByCategory = await axiosClient.post('prd/getProductByCategory', category);
                if (filteredProductByCategory.data && count > 0) {
                    setNoProductMessage(0);
                    setProducts(filteredProductByCategory.data);
                    setFilteredSearchProducts(filteredProductByCategory.data);
                    setCategoryChoosingLoading(false)
                    setSortPrice(null)
                } else {
                    setNoProductMessage(1);
                    setCategoryChoosingLoading(false)
                    setSortPrice(null)
                }
                
            }

            setTimeout(() => {
                setIsCooldown(false);
            }, COOLDOWN_TIME);
        } catch (error) {
            console.log(error);
            setCategoryChoosingLoading(false)
        }
    };

    const handleTabChange = (event, newValue) => {

        setCategoryChoosingLoading(true);
        setSelectedTab(newValue);
        const category = categories[newValue];
        handleCategoryFilter(category.name, category.count);
    };

    const handleApplyPriceRange = async (type, values) => {

        setApplyFilterLoading(true)
        setCurrentPage(1)

        try {
          if (type === 'find') {

            if(applyFilterLoading) {

                enqueueSnackbar(`You might want to calm down a bit.`, { 
                    variant: 'warning',
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

                setApplyFilterLoading(false);
                return;
            }

            if (parseInt(values?.minPrice) <= parseInt(values?.maxPrice) && values?.minPrice !== '' && values?.maxPrice !== '') {

                if(headerText === 'ALL PRODUCTS') {

                    const priceRange = { minimumPrice: parseInt(values?.minPrice), maximumPrice: parseInt(values?.maxPrice)};
                    const response = await axiosClient.post('prd/getProductByPriceRange', priceRange);
    
                    setMinPrice(values?.minPrice);
                    setMaxPrice(values?.maxPrice);
    
                    setIsPriceFilter(true)
                    if (response.data.message) {
                        setNoProductMessage(1);
                    } else {
                        
                        setNoProductMessage(0);
                        setProducts(response.data);
                        setFilteredSearchProducts(response.data);
                    }
                    setApplyFilterLoading(false)

                }else {

                    const productData = { minimumPrice: parseInt(values?.minPrice), maximumPrice: parseInt(values?.maxPrice), category: headerText };
                    const response = await axiosClient.post('prd/getProductByPriceAndCategory', productData);

                    setMinPrice(values?.minPrice);
                    setMaxPrice(values?.maxPrice);
                    setIsPriceFilter(true)

                    if (response.data) {
                        setNoProductMessage(0);
                        setProducts(response.data);
                        setFilteredSearchProducts(response.data);
                    } else {
                        setNoProductMessage(1);
                    }

                    setApplyFilterLoading(false)  
                    setSortPrice(null)                 
                }

            } else {

                setApplyFilterLoading(false)
                enqueueSnackbar(`Invalid Price Range Input`, { 
                    variant: 'error',
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
            }

          }else {

            fetchProducts();

            setIsPriceFilter(false)
            setApplyFilterLoading(false)
            setSortPrice(null)
            setSelectedTab(0)    
            setCurrentPage(1)        
          }
        } catch (error) {
            console.log(error);
            setApplyFilterLoading(false)

        }
    };

    const priceFilterValidationSchema = Yup.object().shape({
        minPrice: Yup.number().min(0, 'Min Price cannot be less than 0').required('Min Price is required'),
        maxPrice: Yup.number().min(0, 'Max Price cannot be less than 0').required('Max Price is required')
          .moreThan(Yup.ref('minPrice'), 'Max Price must be greater than Min Price'),
    });
    
    const priceFilterInitialValues = {
        minPrice: '',
        maxPrice: '',
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredSearchProducts.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div style={styles.root}>
            <Navbar />
            {loading ? (
                <PreLoader />
            ) : (
                <div>
                    <Grid container spacing={3} sx={{ mt: { xs: 7, md: 7} , px: "5%", mb: "25vh" }}>
                        <Grid item xs={12}>
                            <Tabs
                                data-aos="fade-right"
                                ata-aos-offset="300"
                                data-aos-easing="ease-in-sine"
                                data-aos-duration="500"
                                value={selectedTab}
                                onChange={handleTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                aria-label="category tabs"
                                sx={{ marginBottom:{ xs: 0, md: 1} }}
                            >
                                {categories.map((category, index) => (
                                    <Tab
                                        key={index}
                                        disabled = {categoryChoosingLoading}
                                        sx={{ cursor: categoryChoosingLoading ? 'not-allowed' : 'pointer' }}
                                        label={
                                        <Box display="flex" alignItems="center">
                                            {category.icon}
                                            <Typography
                                                gutterBottom
                                                variant="h6"
                                                component="div"
                                                sx={{ fontFamily: "Inter", fontWeight: "bold", textAlign: "left", color: "black", fontSize: { xs: 12, md: 20, opacity: categoryChoosingLoading ? 0.6 : 1}}}
                                            >
                                                {category.name} ({category.count})
                                            </Typography>
                                        </Box>
                                    }
                                    />
                                ))}
                            </Tabs>
                        </Grid>
                        {/* FILTER MAN */}
                        <Grid item xs={12} sm={4} md={3}>
                        <Typography
                            component="div"
                            sx={{ fontFamily: "Kanit", fontWeight: "bold", textAlign: { xs: "center", md: "left"}, color: "black", fontSize: { xs: 25, md: 30} }}
                            data-aos="fade-right" 
                            data-aos-delay="300" 
                        >
                            {headerText}
                        </Typography>

                        <TextField
                            data-aos="fade-up" 
                            data-aos-delay="400"
                            fullWidth
                            label="Search"
                            variant="outlined"
                            sx={{
                                "& input": {
                                    fontFamily: 'Kanit'
                            },
                            }}
                            InputLabelProps={{ 
                                sx: {
                                    fontFamily: 'Kanit'
                            }, 
                            }}
                            value={searchQuery}
                            onChange={handleInputChange}
                            onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                            }}
                            InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                <IconButton onClick={handleSearch}>
                                    <SearchIcon />
                                </IconButton>
                                </InputAdornment>
                            ),
                            }}
                            style={styles.searchBox}
                        />
                        <FormControl
                            data-aos="fade-up" 
                            data-aos-delay="500"
                            fullWidth
                            sx={{
                                mt: 2,
                                mb: 2.5,
                                "& .MuiInputBase-input": {
                                    fontFamily: 'Kanit',
                            },
                            "& .MuiInputLabel-root": {
                                fontFamily: 'Kanit',
                            }
                            }}
                        >
                            <InputLabel>Sort by Price</InputLabel>
                            <Select
                                label="Sort by Price"
                                value={sortPrice}
                                onChange={(e) => {
                                    setSortPrice(e.target.value);
                                    sortProducts(e.target.value);
                                }}
                            >
                            <MenuItem value="desc" sx={{ fontFamily: 'Kanit', fontSize: {xs : 16, md: 20} }}>Highest to Lowest</MenuItem>
                            <MenuItem value="asc" sx={{ fontFamily: 'Kanit', fontSize: {xs : 16, md: 20} }}>Lowest to Highest</MenuItem>
                            </Select>
                        </FormControl>

                        <Typography
                            component="div"
                            sx={{ fontFamily: "Kanit", fontWeight: "bold", textAlign: { xs: "center", md: "left"}, color: "black", fontSize: { xs: 25, md: 30} }}
                            data-aos="fade-right" 
                            data-aos-delay="300" 
                        >
                            PRICE FILTER
                        </Typography>

                        <Formik
                            initialValues={priceFilterInitialValues}
                            validationSchema={priceFilterValidationSchema}
                            onSubmit={(values, { setSubmitting }) => {
                                handleApplyPriceRange('find', values);
                                setSubmitting(false);
                            }}
                        >
                            {({ values, handleChange, handleSubmit, isSubmitting, errors, touched, isValid }) => (
                            <Form onSubmit={handleSubmit}>
                                <Box sx={{ display: 'flex', gap: 3, mb: 2, mt: 2 }}>
                                <Field
                                    data-aos="fade-up" 
                                    data-aos-delay="500" 
                                    as={TextField}
                                    name="minPrice"
                                    label="Min Price"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    value={values.minPrice}
                                    onChange={handleChange}
                                    error={touched.minPrice && !!errors.minPrice}
                                    helperText={touched.minPrice && errors.minPrice && (
                                    <FormHelperText sx={{ fontFamily: 'Kanit', color: 'red', fontSize: 11 }}>
                                        {errors.minPrice}
                                    </FormHelperText>
                                    )}
                                    sx={{
                                    "& input": { fontFamily: 'Kanit' },
                                    "& label": { fontFamily: 'Kanit' }
                                    }}
                                />
                                <Field
                                    data-aos="fade-up" 
                                    data-aos-delay="500" 
                                    as={TextField}
                                    name="maxPrice"
                                    label="Max Price"
                                    type="number"
                                    variant="outlined"
                                    fullWidth
                                    value={values.maxPrice}
                                    onChange={handleChange}
                                    error={touched.maxPrice && !!errors.maxPrice}
                                    helperText={touched.maxPrice && errors.maxPrice && (
                                    <FormHelperText sx={{ fontFamily: 'Kanit', color: 'red', fontSize: 11 }}>
                                        {errors.maxPrice}
                                    </FormHelperText>
                                    )}
                                    sx={{
                                    "& input": { fontFamily: 'Kanit' },
                                    "& label": { fontFamily: 'Kanit' }
                                    }}
                                />
                                </Box>

                                <Button 
                                    variant="contained"
                                    fullWidth
                                    style={{ background: 'linear-gradient(to right, #414141, #000000)' }}
                                    onClick={() => {
                                        handleApplyPriceRange('find', values);
                                    }}
                                    disabled={!isValid || applyFilterLoading || Object.values(values).some(value => value === '')}
                                    sx={{ opacity: !isValid || Object.values(values).some(value => value === '') ? 0.7 : 1 }}
                                    >
                                    <Typography 
                                        sx={{ 
                                            fontFamily: 'Kanit', 
                                            color: 'white', 
                                            fontSize: { xs: 15, md: 20 }, 
                                            p: 0.5,
                                            visibility: applyFilterLoading ? 'hidden' : 'visible'
                                        }}
                                    >
                                    APPLY
                                </Typography>
                                {applyFilterLoading && (
                                    <CircularProgress
                                    size={24}
                                    color="inherit"
                                    sx={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        marginTop: "-12px",
                                        marginLeft: "-12px",
                                        color: 'white'
                                    }}
                                    />
                                )}
                                </Button>
                                <Button
                                    fullWidth
                                    type="button"  
                                    variant="outlined"
                                    sx={{
                                        '&:hover': { borderColor: '#414a4c', backgroundColor: '#414a4c', color: 'white' },
                                        '&:not(:hover)': { borderColor: '#3d4242', color: 'black' },
                                        mt: 2,
                                        visibility: isPriceFilter ? 'visible' : 'hidden',
                                        opacity: applyFilterLoading ? 0.7 : 1,

                                    }}
                                    onClick={() => handleApplyPriceRange('fetch', values)} 
                                >
                                <Typography 
                                    sx={{ 
                                        fontFamily: 'Kanit', 
                                        fontSize: { xs: 15, md: 20 }, 
                                        p: 0.5, 
                                        visibility: applyFilterLoading ? 'hidden' : isPriceFilter ? 'visible' : 'hidden'
                                    }}
                                >
                                    RESET FILTER
                                </Typography>
                                {applyFilterLoading && (
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
                            </Form>
                            )}
                        </Formik>
                        </Grid>
                        {/* PRODUCTS */}
                        <Grid item xs={12} sm={8} md={9}>
                            {noProductMessage ? (
                                <Typography sx={{ fontFamily: 'Kanit', fontSize: { xs: 15, md: 25 }, color: 'black' }}>No products found</Typography>
                            ) : (
                                <>
                                <Grid container spacing={3}>
                                {currentProducts.map((product, index) => (
                                  <Grid item xs={6} sm={6} md={2.4} key={product.id}>
                                    <Card
                                      data-aos="fade-up"
                                      data-aos-delay={index * 100}
                                      data-aos-duration="600"
                                      data-aos-easing="ease-out-back"
                                    >
                                      <CardActionArea onClick={() => handleProductClick(product.productInfo)}>
                                        <CardMedia
                                          component="img"
                                          alt={product.productInfo.productName}
                                          height="350"
                                          image={product.productInfo.productImage}
                                          title={product.productInfo.productName}
                                          style={styles.cardImage}
                                             
                                        />
                                        <CardContent style={styles.cardContent}>
                                          <Typography
                                            gutterBottom
                                            variant="h6"
                                            component="div"
                                            sx={{
                                              fontFamily: "Kanit",
                                              fontWeight: "bold",
                                              textAlign: "left",
                                              color: "black",
                                              fontSize: { xs: 15, md: 20 },
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis'
                                            }}
                                          >
                                            {product.productInfo.productName}
                                          </Typography>
                          
                                          <Rating
                                            name="product-rating"
                                            value={product.productInfo.productRatings}
                                            emptyIcon={<StarBorderIcon sx={{ color: 'linear-gradient(to right, #FABC3C , #FACC6B)', fontSize: '1.15rem' }} />} 
                                            icon={<StarIcon sx={{ color: 'linear-gradient(to right, #FABC3C , #FACC6B)', fontSize: '1.15rem' }} />} 
                                            readOnly
                                            precision={0.5}
                                            sx={{  marginBottom: '4%' }} 
                                            />

                                          <Typography sx={{ fontFamily: "Inter", fontWeight: "medium", textAlign: "left", color: "black", fontSize: { xs: 15, md: 18 } }}>
                                            <b>₱{product.productInfo.productPrice}.00</b>
                                          </Typography>
                                        </CardContent>
                                      </CardActionArea>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>
                               <Grid container justifyContent="center" sx={{ marginTop: 2 }}>
                                <Pagination
                                    count={Math.ceil(filteredSearchProducts.length / itemsPerPage)}
                                    page={currentPage}
                                    onChange={(event, value) => setCurrentPage(value)}
                                    color="primary"
                                />
                                </Grid>
                             </>
                            )}
                        </Grid>
                    </Grid>
                    <Footer />
                    <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="xl">
                        {selectedProduct && (
                            <ProductDescription product={selectedProduct} onClose={handleCloseModal} />
                        )}    
                    </Dialog>
                </div>
            )}
        </div>
    );
}

export default Shop;