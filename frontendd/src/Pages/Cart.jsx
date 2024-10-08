import React from 'react'
import CartTable from '../Components/Tables/CartTable'
import { Typography, Box} from '@mui/material';
import { ToastContainer } from 'react-toastify';

function Cart() {
  return (
    <div>
        
      <CartTable/>
      <ToastContainer/>
         
    </div>
  )
}

export default Cart