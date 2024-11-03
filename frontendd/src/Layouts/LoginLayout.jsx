import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, Outlet } from 'react-router-dom'
import { useStateContext } from '../ContextAPI/ContextAPI';
import { ToastContainer } from 'react-toastify';

const LoginLayout = () => {

  const [cookie, setCookie, removeCookie] = useCookies(['?sessiontoken', "?role"]); 
  const { token, role } = useStateContext();

  if(localStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] === "superadmin") {
    return <Navigate to= '/analytics'/>
  }else if(localStorage.getItem('?sessiontoken') &&  cookie['?sessiontoken'] && cookie['?role'] === "admin") {
    return <Navigate to= '/admin'/>
  }else if( localStorage.getItem('?sessiontoken') &&  cookie['?sessiontoken'] && cookie['?role'] === "user") {
    return <Navigate to= '/home'/>
  }else if((!localStorage.getItem('?sessiontoken') &&  !cookie['?sessiontoken'] && !cookie['?role'] === "user")) {
    return <Navigate to= '/homeViewOnly'/>
  }

  return (
    <div>
        <Outlet/>
        <ToastContainer/>
    </div>
  )
}

export default LoginLayout