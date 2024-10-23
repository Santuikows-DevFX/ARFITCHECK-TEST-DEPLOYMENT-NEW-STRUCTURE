import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import {ContextAPI} from './ContextAPI/ContextAPI'
import { CartProvider } from './ContextAPI/CartProvider'
import { SnackbarProvider } from 'notistack';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ContextAPI>
      <SnackbarProvider maxSnack={3}>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </SnackbarProvider>
    </ContextAPI>
  </React.StrictMode>,
)
