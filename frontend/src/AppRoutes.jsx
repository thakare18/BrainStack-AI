import { BrowserRouter } from 'react-router-dom'
import Routes from './Routes'
import Route from './Route'
import React from 'react'

const AppRoutes = () => {
  return (
    <BrowserRouter>
    <Routes>
        <Route path='/' element={<h1>Home</h1>} />
        
    </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
