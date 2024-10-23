
import {Navigate, createBrowserRouter} from 'react-router-dom'
import LoginLayout from './Layouts/LoginLayout.jsx';

import UserLayout from './Layouts/UserLayout.jsx';
import SuperAdminLayout from './Layouts/SuperAdminLayout';
import AdminLayout from './Layouts/AdminLayout';
import Login from './Pages/Login.jsx';
import Home from './Pages/Home.jsx';
import SignUp from './Pages/SignUp.jsx';

import Shop from './Pages/Shop.jsx';
import ProductDescription from './Pages/Customers/ProductDescription.jsx';
import Cart from './Pages/Cart.jsx';
import Checkout from './Pages/Customers/Checkout.jsx';
import User from './Pages/Customers/Users.jsx';
import OrderSuccess from './Pages/Customers/OrdersSuccess.jsx';
import SuperAdmin from './Pages/SuperAdmins/SuperAdmins.jsx';
import Admin from './Pages/Admins/Admins.jsx';
import About from './Pages/About.jsx';
import Tool from './Pages/Tool.jsx';
import SingleProductCart from './Pages/Customers/SingleProdCart/SingleProductCart.jsx';
import SingleProductCheckout from './Pages/Customers/SingleProdCheckout/SingleProductCheckout.jsx';
import PageNotFound from './Pages/ErrorPages/PageNotFound.jsx';
import CustomProductRequest from './Pages/Customers/CustomProductRequest/CustomProductRequest.jsx';
import URLManipulated from './Pages/ErrorPages/URLManipulatedErr.jsx';

const router = createBrowserRouter([

    {
        path: '/',
        element: <LoginLayout/>,
        children: [
            {
                path: '/',
                element: <Navigate to="/login"/>
            },

            {
                path: '/login',
                element: <Login/>
            }, 

            {
                path: '/signup',
                element: <SignUp/>
            },


        ]
    },

    {
        path: '/',
        element: <UserLayout/>,
        children: [

            {
                path: '/home',
                element: <Home/>
            },
            
            {
                path: '/product/:productName',
                element:<ProductDescription/>
            },

            {
                path: '/cart',
                element: <Cart/>

            },

            {
                path: '/checkout',
                element: <Checkout/>

            },

            {
                path: '/ordersuccess',
                element: <OrderSuccess/>
            },

            {
                path: '/profile',
                element: <User/>
            },

            {
                path: '/shop',
                element: <Shop/>
            },

            {
                path: '/shop/:category',
                element: <Shop/>
            },

            {
                path: '/about',
                element: <About/>
            },
            
            {
                path: '/tool',
                element: <Tool/>
            },

            //mobile routes

            // cart
            {
                path: '/singleProductPurchase/:productID',
                element: <SingleProductCart/>
            },
            
            //checkout & sending custom prd req process
            {
                path: '/singleProductCheckout/:productID/:quantity/:size',
                element: <SingleProductCheckout/>

            },
             
            {
                path: '/customizedSingleProduct/:productID/:customizedProductImageURL/:smallQnt/:mediumQnt/:largeQnt/:extraLargeQnt/:doubleXLQnt/:tripleXLQnt/:customPrice',
                element: <CustomProductRequest/>
            }


        ]
    },

    {
        path:'/',
        element: <SuperAdminLayout/>,
        children: [

            {
                path: '/analytics',
                element: <SuperAdmin/>
            },
        ]
    },

    {
        path: '/',
        element: <AdminLayout/>,
        children: [

            {
                path: '/admin',
                element: <Admin/>
            },
     
        ]
    },


    {
        path: '*',
        element: <PageNotFound/>
    },

    {
        // path: '/urlErr/:errorMsg/:urlPassed',
        path: '/urlErr',
        element: <URLManipulated/>
    }

]);

export default router