import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { useStateContext } from '../ContextAPI/ContextAPI'

const UserLayout = () => {

  const [cookie, setCookie, removeCookie] = useCookies(['?sessiontoken', '?role'])
  
  if(sessionStorage.getItem('?sessiontoken') == null || !cookie['?sessiontoken']) {
    return <Navigate to= '/login'/>

  }else if(sessionStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] != 'user') {
    if(cookie['?role'] === 'superadmin') {
      return <Navigate to= '/analytics'/>
    }else if(cookie['?role'] === 'admin') {
      return <Navigate to= '/admin'/>
    }
  }

  return (
    <div>
        <Outlet/>
    </div>
  )
}

export default UserLayout