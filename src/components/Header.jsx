import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import '../Style/Header.css'; 


const icons = {
    umbrella: '☔', 
    storm: '⛈️',   
    list: '📋',   
    map: '🗺️',     
    settings: '⚙️', 
    menu: '☰', 
    close: '✖', 
};

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };
    
   
    const closeSidebar = () => {
        if (isOpen) {
            setIsOpen(false);
        }
    };
    
  
    const isActive = (path) => location.pathname === path;

    return (
        <>
        
            <button 
                className="mobile-menu-toggle" 
                onClick={toggleSidebar}
                aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
                {isOpen ? icons.close : icons.menu}
            </button>

            <header className={`nav-header ${isOpen ? 'open' : ''}`}>
                
                <div className="nav-top-icon" aria-label="Icône de l'application Météo">
                    {icons.umbrella}
                </div>

                <nav className="nav-container">
                    <ul className="nav-list">
                        
                    
                        <li className="nav-item">
                         
                            <Link 
                                to="/" 
                                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                                onClick={closeSidebar}
                            >
                                <span className="nav-icon">{icons.storm}</span>
                                <span className="nav-text">Météo</span>
                            </Link>
                        </li> 

                       
                        <li className="nav-item">
                            
                            <Link 
                                to="/services" 
                                className={`nav-link ${isActive('/services') ? 'active' : ''}`} 
                                onClick={closeSidebar}
                            >
                                <span className="nav-icon">{icons.list}</span>
                                <span className="nav-text">Villes</span>
                            </Link>
                        </li>
                        
                       
                        <li className="nav-item">
                            
                            <Link 
                                to="/map" 
                                className={`nav-link ${isActive('/map') ? 'active' : ''}`} 
                                onClick={closeSidebar}
                            >
                                <span className="nav-icon">{icons.map}</span>
                                <span className="nav-text">Map</span>
                            </Link>
                        </li>

                        
                        <li className="nav-item">

                            <Link 
                                to="/contact" 
                                className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
                                onClick={closeSidebar}
                            >
                                <span className="nav-icon">{icons.settings}</span>
                                <span className="nav-text">Parametre</span>
                            </Link>
                        </li>

                    </ul>
                </nav>
            </header>
            
          
            {isOpen && <div className="mobile-overlay" onClick={toggleSidebar}></div>}
        </>
    );
}

export default Header;