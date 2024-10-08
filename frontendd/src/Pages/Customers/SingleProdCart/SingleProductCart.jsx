import React from 'react'
import { ToastContainer } from 'react-toastify';
import SingleProductCartTable from '../../../Components/Tables/SingleProductCartTable';

function SingleProductCart() {
  return (
    <div>
        
      <SingleProductCartTable/>
      <ToastContainer/>
         
    </div>
  )
}

export default SingleProductCart