import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useStateContext } from '../ContextAPI/ContextAPI'

const UserLayout = () => {

  const [cookie, setCookie, removeCookie] = useCookies(['?sessiontoken', '?role'])
  
  if(localStorage.getItem('?sessiontoken') == null || !cookie['?sessiontoken']) {
    return <Navigate to= '/login'/>

  }else if(localStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] != 'user') {
    if(cookie['?role'] === 'superadmin') {
      return <Navigate to= '/analytics'/>
    }else if(cookie['?role'] === 'admin') {
      return <Navigate to= '/admin'/>
    }
  }

  return (
    <div>
        <Outlet/>
        <ToastContainer/>
    </div>
  )
}

export default UserLayout