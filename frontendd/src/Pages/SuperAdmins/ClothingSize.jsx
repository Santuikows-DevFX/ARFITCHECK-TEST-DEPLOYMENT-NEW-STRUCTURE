import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, Divider, MenuItem, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';
import PreLoader from '../../Components/PreLoader';
import { useCookies } from 'react-cookie';
import axiosClient from '../../axios-client';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useSnackbar } from 'notistack';

function ClothingSize() {
  const [isLoading, setIsLoading] = useState(true);
  const [sizeData, setSizeData] = useState([]);
  const [editing, setEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('T-Shirt');
  const [isSaveLoading, setIsSaveLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const { enqueueSnackbar  } = useSnackbar();

  const clothingCategories = ['T-Shirt', 'Shorts', 'Hoodies'];

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchClothingSizeData();
  }, [selectedCategory]);

  const fetchClothingSizeData = async () => {
    try {
      setIsDataLoading(true);
      const sizeDataResponse = await axiosClient.get(`/size/fetchClothingSizes/${selectedCategory}`);
      if (sizeDataResponse.data) {
        const sortedData = sortSizes(sizeDataResponse.data);
        setSizeData(sortedData);
      }
      setIsDataLoading(false);
    } catch (error) {
      console.error(error);
      setIsDataLoading(false);
    }
  };

  const sortSizes = (sizes) => {
    return sizes.sort((a, b) => a.sizeInfo.length - b.sizeInfo.length);
  };

  //TODO: VALIDATE THE CHANGES IT MUST HAVE MIN AND MAX TO PREVENT UNREALISTIC CHANGES
  const handleSaveChanges = async () => {
    try {
      setIsSaveLoading(true);
      await axiosClient.post('/size/updateClothingSize', sizeData)
        .then(({ data }) => {
          enqueueSnackbar(`${data.message}`, { 
            variant: 'success',
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'right'
            },
            autoHideDuration: 2000,
            style: {
              fontFamily: 'Kanit',
              fontSize: '16px'
            },
            
          });
          setEditing(false);
          setIsSaveLoading(false);
        });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProducts = () => {
    setEditing(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const convertInchesToCm = (inches) => {
    return (inches * 2.54).toFixed(2); 
  };

  const handleInputChange = (e, sizeID, field) => {
    const newSizeData = sizeData.map(size => {
      if (size.sizeID === sizeID) {
        const value = e.target.value;
        const updatedSizeInfo = { ...size.sizeInfo, [field]: value };

        if (field === 'width' || field === 'waist') {
          updatedSizeInfo[field === 'width' ? 'centiWidth' : 'centiWaist'] = convertInchesToCm(value);
        } else if (field === 'length') {
          updatedSizeInfo.centiLength = convertInchesToCm(value);
        } else if (field === 'sleeves' || field === 'legHole') {
          updatedSizeInfo[field === 'sleeves' ? 'centiSleeves' : 'centiLegHole'] = convertInchesToCm(value);
        }

        return { ...size, sizeInfo: updatedSizeInfo };
      }
      return size;
    });

    setSizeData(newSizeData);
  };

  return (
    <div>
      {isLoading ? (
        <PreLoader />
      ) : (
        <Box m={2} height="100vh" sx={{ mt: 5 }}>
          <Grid container direction="column" spacing={2}>
            <Grid item container justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: 'Kanit', fontSize: 50, fontWeight: 'bold', color: 'black', paddingY: '1vh' }}>
                Size Table
              </Typography>
              <Grid container spacing={4} sx={{ width: "45%", justifyContent: 'center', alignItems: "center" }}>
                <Grid item xs={6} sx={{ marginLeft: '45%' }}>
                  <TextField
                    select
                    value={selectedCategory}
                    label="Clothing Category"
                    variant="filled"
                    fullWidth
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    InputLabelProps={{ sx: { fontFamily: 'Kanit', fontSize: 20 } }}
                  >
                    {clothingCategories.map((option) => (
                      <MenuItem key={option} value={option}>
                        <Typography sx={{ fontFamily: 'Kanit', fontSize: 20, fontWeight: 'medium', color: 'black' }}>
                          {option}
                        </Typography>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider sx={{ borderTopWidth: 2, mb: 3 }} />
            </Grid>
          </Grid>
          <Box bgcolor="white" p={2} borderRadius={1} boxShadow={3}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontFamily: 'Kanit', fontSize: 30, fontWeight: 'bold', color: 'black' }}>
                Category: {selectedCategory.toUpperCase()}
              </Typography>

              <Divider sx={{ backgroundColor: 'black' }} />

              {editing ? (
                <Button
                  variant="contained"
                  onClick={handleSaveChanges}
                  sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#860000', color: 'white' },
                    height: '50px',
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: 18,
                      padding: 0.5,
                      visibility: isSaveLoading ? 'hidden' : 'visible',
                    }}
                  >
                    SAVE CHANGES
                  </Typography>
                  {isSaveLoading && (
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
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleEditProducts}
                  sx={{
                    backgroundColor: 'White',
                    '&:hover': { backgroundColor: '#414a4c', color: 'white' },
                    '&:not(:hover)': { backgroundColor: '#317000', color: 'white' },
                    height: '50px'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: 'Kanit',
                      fontSize: 18,
                      padding: 0.5,
                    }}
                  >
                    EDIT CLOTHING SIZE
                  </Typography>
                </Button>
              )}
            </Grid>
            <Box mt={3}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 24, fontWeight: 'bold', color: 'black', mb: 2, textAlign: 'center' }}>
                    BMIC Size
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              SIZE
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {selectedCategory === 'T-Shirt' ? 'WIDTH (inch.)' : 'WAIST (inch.)'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {selectedCategory === 'T-Shirt' ? 'LENGTH (inch.)' : 'LENGTH (inch.)'}
                            </Typography>
                          </TableCell>
                          {selectedCategory === 'T-Shirt' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                SLEEVES (inch.)
                              </Typography>
                            </TableCell>
                          )}
                          {selectedCategory === 'Shorts' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                LEG HOLE (inch.)
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sizeData.map((size, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                <b>{size.sizeInfo.size}</b>
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              {editing ? (
                                <TextField
                                  fullWidth
                                  variant="standard"
                                  value={size.sizeInfo[selectedCategory === 'T-Shirt' ? 'width' : 'waist']}
                                  onChange={(e) => handleInputChange(e, size.sizeID, selectedCategory === 'T-Shirt' ? 'width' : 'waist')}
                                  sx={{
                                    fontFamily: 'Inter',
                                    fontSize: 14, 
                                    fontWeight: 500,
                                    color: 'black',
                                    width: '70px',
                                    padding: '0 5px', 
                                  }}
                                  InputProps={{
                                    inputProps: {
                                      min: 0,
                                    },
                                  }}
                                />
                              ) : (
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo[selectedCategory === 'T-Shirt' ? 'width' : 'waist']}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              {editing ? (
                                <TextField
                                  fullWidth
                                  variant="standard"
                                  value={size.sizeInfo.length}
                                  onChange={(e) => handleInputChange(e, size.sizeID, 'length')}
                                  sx={{
                                    fontFamily: 'Inter',
                                    fontSize: 14, 
                                    fontWeight: 500,
                                    color: 'black',
                                    width: '70px',
                                    padding: '0 5px', 
                                  }}
                                  InputProps={{
                                    inputProps: {
                                      min: 0,
                                    },
                                  }}
                                />
                              ) : (
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo.length}
                                </Typography>
                              )}
                            </TableCell>
                            {selectedCategory === 'T-Shirt' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                {editing ? (
                                  <TextField
                                    fullWidth
                                    variant="standard"
                                    value={size.sizeInfo.sleeves}
                                    onChange={(e) => handleInputChange(e, size.sizeID, 'sleeves')}
                                    sx={{
                                      fontFamily: 'Inter',
                                      fontSize: 14, 
                                      fontWeight: 500,
                                      color: 'black',
                                      width: '70px',
                                      padding: '0 5px', 
                                    }}
                                    InputProps={{
                                      inputProps: {
                                        min: 0,
                                      },
                                    }}
                                  />
                                ) : (
                                  <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                    {size.sizeInfo.sleeves}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                            {selectedCategory === 'Shorts' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                {editing ? (
                                  <TextField
                                    fullWidth
                                    variant="standard"
                                    value={size.sizeInfo.legHole}
                                    onChange={(e) => handleInputChange(e, size.sizeID, 'legHole')}
                                    sx={{
                                      fontFamily: 'Inter',
                                      fontSize: 14, 
                                      fontWeight: 500,
                                      color: 'black',
                                      width: '70px',
                                      padding: '0 5px', 
                                    }}
                                    InputProps={{
                                      inputProps: {
                                        min: 0,
                                        step: "0.1", 
                                      },
                                    }}
                                  />
                                ) : (
                                  <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                    {size.sizeInfo.legHole}
                                  </Typography>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography sx={{ fontFamily: 'Kanit', fontSize: 24, fontWeight: 'bold', color: 'black', mb: 2, textAlign: 'center' }}>
                    Size Conversion
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {selectedCategory === 'T-Shirt' ? 'WIDTH (cm)' : 'WAIST (cm)'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {selectedCategory === 'T-Shirt' ? 'LENGTH (cm)' : 'LENGTH (cm)'}
                            </Typography>
                          </TableCell>
                          {selectedCategory === 'T-Shirt' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                SLEEVES (cm)
                              </Typography>
                            </TableCell>
                          )}
                          {selectedCategory === 'Shorts' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                LEG HOLE (cm)
                              </Typography>
                            </TableCell>
                          )}
                          <TableCell sx={{ backgroundColor: 'black', color: 'white' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, paddingY: '1vh' }}>
                              US
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, paddingY: '1vh' }}>
                              UK
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 600, paddingY: '1vh' }}>
                              EU
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sizeData.map((size, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                {selectedCategory === 'T-Shirt' ? size.sizeInfo.centiWidth : size.sizeInfo.centiWaist}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                {size.sizeInfo.centiLength}
                              </Typography>
                            </TableCell>
                            {selectedCategory === 'T-Shirt' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo.centiSleeves}
                                </Typography>
                              </TableCell>
                            )}
                            {selectedCategory === 'Shorts' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo.centiLegHole}
                                </Typography>
                              </TableCell>
                            )}
                            <TableCell style={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: 'black' }}>
                                {size.sizeInfo.usSize}
                              </Typography>
                            </TableCell>
                            <TableCell style={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: 'black' }}>
                                {size.sizeInfo.ukSize}
                              </Typography>
                            </TableCell>
                            <TableCell style={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 16, fontWeight: 500, color: 'black' }}>
                                {size.sizeInfo.euSize}
                              </Typography>
                            </TableCell> 
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </div>
  );
}

export default ClothingSize;
