import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Layout Component
import Layout from '../Public/Layout'; 

// Public Page Components (Assuming paths are correct)
import Home from '../Public/Home';     // Corrected from '../Public/Contact'
import Contact from '../Public/Contact';
import Services from '../Public/Services'; // Added missing import
import Map from '../Public/Map'; // Added missing import

// Utility Components
import Error from '../../_utils/Error';


function PublicRoute() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* The index route renders 'Home' when path is exactly '/' */}
        <Route index element={<Home />} /> 
        
        {/* A separate route for /home, though the index route covers it */}
        <Route path="home" element={<Home />} /> 
        
        <Route path="services" element={<Services />} />
        <Route path="contact" element={<Contact />} />
        <Route path="Map"  element={<Map />} />
        
        
        <Route path="*" element={<Error />} /> 
      </Route>
    </Routes>
  )
}

export default PublicRoute;