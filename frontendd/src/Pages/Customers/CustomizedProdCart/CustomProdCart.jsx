import React from 'react'
import { ToastContainer } from 'react-toastify';
import CustomProdCartTable from '../../../Components/Tables/CustomProdCartTable';

function CustomProdCart() {
  return (
    <div>
    
      <CustomProdCartTable/>
      <ToastContainer/>
         
    </div>
  )
}

export default CustomProdCart