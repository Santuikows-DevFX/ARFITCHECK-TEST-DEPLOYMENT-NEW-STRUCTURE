import React from 'react'
import { useCookies } from 'react-cookie'
import { Navigate, Outlet } from 'react-router-dom'

const AdminLayout = () => {

  const [cookie, setCookie] = useCookies(['?sessiontoken','?role'])
  // const { token } = useStateContext();


  if(sessionStorage.getItem('?sessiontoken') == null || !cookie['?sessiontoken']) {
    return <Navigate to= '/login'/>
  }else if(sessionStorage.getItem('?sessiontoken') && cookie['?sessiontoken'] && cookie['?role'] != 'admin') {
    if(cookie['?role'] === 'superadmin') {
      return <Navigate to= '/analytics'/>
    }else if(cookie['?role'] === 'user'){
      return <Navigate to= '/home'/>
    }
  }

  return (
    <div>
        <Outlet/>
    </div>
  )
}

export default AdminLayout