import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Database, 
  Wand2, 
  CalendarDays,
  LogOut,
  GraduationCap,
  ClipboardCheck,
  BarChart3,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // App.jsx routing handles the redirect since user is cleared
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="sidebar glass-panel" style={{ margin: '1rem', height: 'calc(100vh - 2rem)', border: '1px solid var(--glass-border)' }}>
      <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '0.5rem' }}>
            <GraduationCap size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', margin: 0 }}>Smart<span className="gradient-text">Class</span></h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Timetable Scheduler</p>
          </div>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Welcome,</div>
        <div style={{ fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
          {user?.user_metadata?.name || user?.email?.split('@')[0] || "Administrator"}
        </div>
      </div>
      
      <nav className={`sidebar-nav ${isOpen ? 'mobile-open' : ''}`}>
        <NavLink 
          to="/app/dashboard" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={() => setIsOpen(false)}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/app/master-data" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={() => setIsOpen(false)}
        >
          <Database size={20} />
          <span>Master Data</span>
        </NavLink>
        
        <NavLink 
          to="/app/generate" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={() => setIsOpen(false)}
        >
          <Wand2 size={20} />
          <span>Generate Schedule</span>
        </NavLink>

        <NavLink 
          to="/app/attendance" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={() => setIsOpen(false)}
        >
          <ClipboardCheck size={20} />
          <span>Track Attendance</span>
        </NavLink>

        <NavLink 
          to="/app/attendance-reports" 
          className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          onClick={() => setIsOpen(false)}
        >
          <BarChart3 size={20} />
          <span>Attendance Analytics</span>
        </NavLink>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button 
            onClick={toggleTheme}
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="nav-item" 
            style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
