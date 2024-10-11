import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, Outlet } from 'react-router-dom'

const SuperAdminLayout = () => {

  const [cookie, setCookie] = useCookies(['?sessiontoken','?role'])

  if(!cookie['?sessiontoken']){
    return <Navigate to= '/login'/>
  }else if(localStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] == 'user') {
    return <Navigate to= '/home'/>
  }else if(localStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] == 'admin') {
    return <Navigate to= '/admin'/>
  }

  return (
    <div>
        <Outlet/>
    </div>
  )
}

export default SuperAdminLayout