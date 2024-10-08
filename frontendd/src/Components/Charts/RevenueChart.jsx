import React from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';

function RevenueChart() {
  // Sample prices data
  const todayPrices = [100, 120, 110, 130, 125, 140]; 
  const yesterdayPrices = [90, 110, 100, 120, 115, 130]; 

  return (
    <Box sx={{ bgcolor: 'white', padding: '20px', borderRadius: 5 }}>
      {/* Legend */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <Box sx={{ width: '10px', height: '10px', bgcolor: 'red', marginRight: '5px' }} />
          <Typography variant="body1" sx={{ fontFamily: 'Inter', fontWeight: 'medium', color: 'black', fontSize: 14 }}>Today</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: '10px', height: '10px', bgcolor: 'blue', marginRight: '5px' }} />
          <Typography variant="body1" sx={{ fontFamily: 'Inter', fontWeight: 'medium', color: 'black', fontSize: 14 }}>Yesterday</Typography>
        </Box>
      </Box>
      <Typography variant="h5" sx={{ fontFamily: 'Kanit', fontWeight: 'bold', color: 'black', marginBottom: '20px', textAlign: 'center' }}>
        SALES CHART (Daily)
      </Typography>
      <LineChart
        xAxis={[{ data: [1, 2, 3, 4, 5, 6] }]} 
        series={[
          {
            data: todayPrices,
            name: 'Today',
            color: 'red',
          },
          {
            data: yesterdayPrices,
            name: 'Yesterday',
            color: 'blue',
          },
        ]}
        fullWidth
        height={500}
      />
    </Box>
  );
}

export default RevenueChart;
