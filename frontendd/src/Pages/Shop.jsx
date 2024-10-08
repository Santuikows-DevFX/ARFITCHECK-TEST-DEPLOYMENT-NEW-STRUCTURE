import React, { useEffect, useRef, useState } from 'react';
import { Grid, Card, CardContent, Typography, Dialog, Box, TextField, InputAdornment, IconButton, CardActionArea, CardMedia, Button, Rating, CircularProgress, Tabs, Tab, Pagination } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';

import Footer from '../Components/Footer';
import axiosClient from '../axios-client';
import ProductDescription from './Customers/ProductDescription';
import { useCookies } from 'react-cookie';
import PreLoader from '../Components/PreLoader';

import { ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';

import AOS from 'aos';
import 'aos/dist/aos.css'
import Navbar from '../WIdgets/Navbar';
import { useParams } from 'react-router-dom';

AOS.init({
    duration: 600, 
    easing: 'ease-out-back', 
  });
const styles = {
    root: {
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
      
        backgroundImage: `url("../public/assets/shopGraffiti1.png")`,
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
    },
    searchBox: {
        marginTop: 20,
        marginBottom: 20,
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
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [products, setProducts] = useState([]);
    const [filteredSearchProducts, setFilteredSearchProducts] = useState([]);
    const [categoryCount, setCategoryCount] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
  
    const [loading, isLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false);
    const [isPriceFilter, setIsPriceFilter] = useState(false);
    const [applyFilterLoading, setApplyFilterLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const lastClickTimeRef = useRef(0);
    const { category } = useParams();

    const COOLDOWN_TIME = 200;

    useEffect(() => {

        AOS.init();

        category === undefined ? fetchProducts() : fetchProductsByChosenCateg();
        
    }, [category]);

    const categories = [
        { name: 'All', icon: <img src='../public/assets/all.png' alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalProduct},
        { name: 'T-shirts', icon: <img src='../public/assets/shirt.png' alt='icon' style={{ width: '35px', height: '35px' }}/> ,count: categoryCount.totalTShirt },
        { name: 'Shorts', icon: <img src='../public/assets/short.png' alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalShorts },
        { name: 'Caps', icon: <img src='../public/assets/cap.png' alt='icon' style={{ width: '35px', height: '35px' }}/> , count: categoryCount.totalCaps},
        { name: 'Hoodies', icon: <img src='../public/assets/hoodie.png' alt='icon' style={{ width: '35px', height: '35px' }}/>, count: categoryCount.totalHoodies},
    ];

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
            }

        }catch(error) {

        }
    }

    const fetchProducts = async () => {
        try {
            isLoading(true);
            const productResponse = await axiosClient.get(`prd/getProducts/${cookie['?role']}`);
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

        if (currentTime - lastClickTimeRef.current < COOLDOWN_TIME) {
            toast.warning("You might want to calm down a bit...", {
                position: "top-right",
                autoClose: 2300,
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

        lastClickTimeRef.current = currentTime;

        if (newHeaderText === 'All') {
            newHeaderText = 'ALL PRODUCTS';
        }
        setHeaderText(newHeaderText.toUpperCase());

        try {
            const category = { category: newHeaderText };
            const filteredProductByCategory = await axiosClient.post('prd/getProductByCategory', category);
            if (filteredProductByCategory.data && count > 0) {
                setNoProductMessage(0);
                setProducts(filteredProductByCategory.data);
                setFilteredSearchProducts(filteredProductByCategory.data);
            } else {
                setNoProductMessage(1);
            }

            setTimeout(() => {
                setIsCooldown(false);
            }, COOLDOWN_TIME);
        } catch (error) {
            console.log(error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
        const category = categories[newValue];
        handleCategoryFilter(category.name, category.count);
    };

    const handleApplyPriceRange = async (type) => {

        setApplyFilterLoading(true)

        try {
          if (type === 'find') {
            const numericRegex = /^[0-9]*$/;

            if (parseInt(minPrice) <= parseInt(maxPrice) && minPrice !== '' && maxPrice !== '' && numericRegex.test(minPrice) && numericRegex.test(maxPrice)) {
                const priceRange = { minimumPrice: parseInt(minPrice), maximumPrice: parseInt(maxPrice) };
                const response = await axiosClient.post('prd/getProductByPriceRange', priceRange);
                setIsPriceFilter(true)
                if (response.data.message) {
                    setNoProductMessage(1);
                } else {
                    
                    setNoProductMessage(0);
                    setProducts(response.data);
                    setFilteredSearchProducts(response.data);
                }
                setApplyFilterLoading(false)
            } else {

                setApplyFilterLoading(false)
                toast.error("Invalid Price Range Input", {
                    position: "top-right",
                    autoClose: 2300,
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
          }else {
            setIsPriceFilter(false)
            setApplyFilterLoading(false)
            fetchProducts();
          }
        } catch (error) {
            console.log(error);
        }
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
                                        label={
                                    <Box display="flex" alignItems="center">
                                        {category.icon}
                                        <Typography
                                    gutterBottom
                                    variant="h6"
                                    component="div"
                                    sx={{ fontFamily: "Inter", fontWeight: "bold", textAlign: "left", color: "black", fontSize: { xs: 12, md: 20}}}
                                >
                                                    {category.name} ({category.count})
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                ))}
                            </Tabs>
                        </Grid>
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
                            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                <TextField
                                    type='number'
                                    data-aos="fade-up" 
                                    data-aos-delay="500"
                                    label="Min Price"
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
                                    variant="outlined"
                                    value={minPrice}
                                    fullWidth
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || parseFloat(value) >= 0) {
                                            setMinPrice(value);
                                        }
                                    }}
                                />
                                <TextField
                                    type='number'
                                    data-aos="fade-up" 
                                    data-aos-delay="500"
                                    label="Max Price"
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
                                    value={maxPrice}
                                    fullWidth
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || parseFloat(value) >= 0) {
                                            setMaxPrice(value);
                                        }
                                    }}
                                />
                              
                            </Box>
                            {/* APPLY FILTER FOR PRICE */}
                            <Button 
                                data-aos="fade-up" 
                                data-aos-delay="500" variant="contained" fullWidth style={{ background: 'linear-gradient(to right, #414141  , #000000)' }} onClick={() => {
                                  handleApplyPriceRange('find')
                                }}
                            >
                                <Typography 
                                    sx={{ 
                                        fontFamily: 'Kanit', 
                                        color: 'white', 
                                        fontSize: { xs: 15, md: 20 }, 
                                        p: 0.5,
                                        visibility: applyFilterLoading ? 'hidden' : 'visible',
                                    }}
                                > APPLY
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
                            {/* UNDO APPLY FILTER */}
                            <Button
                                data-aos="fade-up" 
                                data-aos-delay="500" 
                                fullWidth
                                type="button"  
                                variant="outlined"
                                sx={{
                                    '&:hover': { borderColor: '#414a4c', backgroundColor: '#414a4c', color: 'white' },
                                    '&:not(:hover)': { borderColor: '#3d4242', color: 'black' },
                                    mt: 2,
                                    visibility: isPriceFilter ? 'visible' : 'hidden'
                                }}
                                onClick={() => handleApplyPriceRange('fetch')} 
                            >
                                <Typography sx={{ 
                                    fontFamily: 'Kanit', 
                                    fontSize: { xs: 15, md: 20 }, 
                                    p: 0.5, 
                                    visibility: applyFilterLoading ? 'hidden' : isPriceFilter ? 'visible' : 'hidden'
                                }}>
                                    GET ALL PRODUCTS
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
                        </Grid>
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
                    <ToastContainer />
                </div>
            )}
        </div>
    );
}

export default Shop;