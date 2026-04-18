import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      <main className="main-content">
        <button 
          className="mobile-menu-btn" 
          style={{ position: 'fixed', top: '1.25rem', left: '1.25rem', zIndex: 1100 }}
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {isMenuOpen && (
          <div 
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(0,0,0,0.5)', 
              backdropFilter: 'blur(4px)',
              zIndex: 999 
            }}
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
