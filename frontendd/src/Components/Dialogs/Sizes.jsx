import React, { useEffect, useState } from 'react';
import { Typography, Grid, Box, Dialog, DialogTitle, DialogContent, TableContainer, TableRow, TableBody, Paper, Table, TableHead, TableCell } from '@mui/material';
import axiosClient from '../../axios-client';

import 'react-toastify/dist/ReactToastify.css';

import { Close } from '@mui/icons-material';

function Sizes({ onClose, open, category }) {

    const [sizeData, setSizeData] = useState([]);

    useEffect(() => {
      fetchSizeData();
    }, [])

    const fetchSizeData = async () => {
        
        try {

            const sizeDataResponse = await axiosClient.get(`size/fetchClothingSizes/${category}`)
            if(sizeDataResponse.data) {
                setSizeData(sizeDataResponse.data)
            }

        }catch(error) {
            console.log(error);
        }
    }

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    return (
        <div style={{ margin: 0, padding: 0 }}>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
                <DialogTitle sx={{ background: 'linear-gradient(to left, #414141  , #000000)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Typography  sx={{ fontFamily: 'Kanit', fontWeight: 'bold', fontSize: 34 }}>
                    SIZE CHART
                </Typography>
                <Close onClick={onClose} sx={{ cursor: 'pointer' }} />
            </DialogTitle> 
            <DialogContent>
            <Box mt={3}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} style={{ backgroundColor: '#eaecee' }}>
                    <Table >
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              SIZE
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {category === 'T-Shirt' ? 'WIDTH (inch.)' : 'WAIST (inch.)'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {category === 'T-Shirt' ? 'LENGTH (inch.)' : 'LENGTH (inch.)'}
                            </Typography>
                          </TableCell>
                          {category === 'T-Shirt' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                SLEEVES (inch.)
                              </Typography>
                            </TableCell>
                          )}
                          {category === 'Shorts' && (
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
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo[category === 'T-Shirt' ? 'width' : 'waist']}
                                </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                    {size.sizeInfo.length}
                                </Typography>
                            </TableCell>
                            {category === 'T-Shirt' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                  <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                    {size.sizeInfo.sleeves}
                                  </Typography>
                              </TableCell>
                            )}
                            {category === 'Shorts' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                    {size.sizeInfo.legHole}
                                  </Typography>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TableContainer component={Paper} style={{ backgroundColor: '#eaecee' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {category === 'T-Shirt' ? 'WIDTH (cm)' : 'WAIST (cm)'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                            <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                              {category === 'T-Shirt' ? 'LENGTH (cm)' : 'LENGTH (cm)'}
                            </Typography>
                          </TableCell>
                          {category === 'T-Shirt' && (
                            <TableCell sx={{ backgroundColor: 'black', color: 'white', textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 17, fontWeight: 600, paddingY: '1vh' }}>
                                SLEEVES (cm)
                              </Typography>
                            </TableCell>
                          )}
                          {category === 'Shorts' && (
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
                                {category === 'T-Shirt' ? size.sizeInfo.centiWidth : size.sizeInfo.centiWaist}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                {size.sizeInfo.centiLength}
                              </Typography>
                            </TableCell>
                            {category === 'T-Shirt' && (
                              <TableCell sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600 }}>
                                  {size.sizeInfo.centiSleeves}
                                </Typography>
                              </TableCell>
                            )}
                            {category === 'Shorts' && (
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
            </DialogContent>
        </Dialog>
        </div>
    );
}

export default Sizes;
