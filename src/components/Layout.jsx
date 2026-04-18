import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="page-wrapper animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
