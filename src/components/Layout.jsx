import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard, Building2, CalendarDays,
  LogOut, Home, Menu, X, Users
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/admin/cleaners', label: 'Cleaners', icon: Users },
  ];

  const clientLinks = [
    { to: '/client', label: 'Overview', icon: LayoutDashboard },
    { to: '/client/properties', label: 'Properties', icon: Building2 },
  ];

  const cleanerLinks = [
    { to: '/cleaner', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/cleaner/calendar', label: 'My Schedule', icon: CalendarDays },
  ];

  const links = user?.role === 'admin'
    ? adminLinks
    : user?.role === 'cleaner'
    ? cleanerLinks
    : clientLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '28px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(196,98,45,0.4)',
          }}>
            <Home size={18} color="white" />
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px', fontWeight: '600',
              color: 'white', lineHeight: 1,
              letterSpacing: '-0.3px',
            }}>CleanSync</p>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
              PROPERTY MANAGEMENT
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <p style={{
          fontSize: '10px', fontWeight: '600',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)',
          padding: '0 10px', marginBottom: '6px',
        }}>
          {user?.role === 'admin' ? 'Management' : user?.role === 'cleaner' ? 'My Work' : 'My Portal'}
        </p>
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={() => setSidebarOpen(false)}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 12px',
              borderRadius: '12px',
              fontSize: '14px', fontWeight: isActive ? '500' : '400',
              marginBottom: '3px',
              textDecoration: 'none',
              background: isActive
                ? 'linear-gradient(135deg, rgba(196,98,45,0.25), rgba(232,146,74,0.15))'
                : 'transparent',
              color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
              borderLeft: isActive ? '3px solid var(--amber)' : '3px solid transparent',
              transition: 'all 0.2s ease',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} color={isActive ? 'var(--amber)' : 'rgba(255,255,255,0.45)'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

      <div style={{ padding: '16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px',
          borderRadius: '14px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            width: '36px', height: '36px', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--terracotta), var(--gold))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '600', color: 'white',
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: '13px', fontWeight: '500', color: 'white',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}>
              {user?.role}
            </p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)', padding: '6px',
              borderRadius: '8px', display: 'flex', alignItems: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'none'; }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--cream)' }}>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside style={{
        width: '240px', minWidth: '240px',
        background: 'linear-gradient(180deg, var(--espresso) 0%, var(--mahogany) 100%)',
        height: '100vh',
        display: 'none',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 10,
        boxShadow: '4px 0 24px rgba(28,20,16,0.15)',
      }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      <aside style={{
        position: 'fixed',
        left: sidebarOpen ? 0 : '-260px',
        top: 0, bottom: 0,
        width: '260px',
        background: 'linear-gradient(180deg, var(--espresso) 0%, var(--mahogany) 100%)',
        zIndex: 50,
        transition: 'left 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex', flexDirection: 'column',
        boxShadow: sidebarOpen ? '8px 0 32px rgba(28,20,16,0.3)' : 'none',
      }}>
        <button
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'absolute', top: '16px', right: '-44px',
            width: '36px', height: '36px',
            background: 'var(--espresso)',
            border: 'none', cursor: 'pointer',
            borderRadius: '0 8px 8px 0',
            display: sidebarOpen ? 'flex' : 'none',
            alignItems: 'center', justifyContent: 'center',
            color: 'white',
          }}
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{
          height: '64px', flexShrink: 0,
          background: 'var(--ivory)',
          borderBottom: '1px solid var(--warm-100)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-btn"
              style={{
                width: '36px', height: '36px',
                background: 'var(--warm-100)',
                border: '1px solid var(--warm-200)',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--espresso)',
              }}
            >
              <Menu size={18} />
            </button>
            <div>
              <p style={{ fontSize: '13px', color: 'var(--warm-300)', fontWeight: '400' }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric',
                  month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              padding: '6px 14px',
              background: user?.role === 'admin'
                ? 'linear-gradient(135deg, rgba(196,98,45,0.12), rgba(232,146,74,0.08))'
                : user?.role === 'cleaner'
                ? 'linear-gradient(135deg, rgba(45,106,143,0.12), rgba(45,106,143,0.06))'
                : 'linear-gradient(135deg, rgba(74,124,89,0.12), rgba(74,124,89,0.06))',
              border: `1px solid ${user?.role === 'admin'
                ? 'rgba(196,98,45,0.2)'
                : user?.role === 'cleaner'
                ? 'rgba(45,106,143,0.2)'
                : 'rgba(74,124,89,0.2)'}`,
              borderRadius: '99px',
              fontSize: '12px', fontWeight: '500',
              color: user?.role === 'admin'
                ? 'var(--terracotta)'
                : user?.role === 'cleaner'
                ? 'var(--info)'
                : 'var(--success)',
            }}>
              {user?.role === 'admin' ? '⚡ Admin Portal' : user?.role === 'cleaner' ? '🧹 Cleaner Portal' : '🏠 Client Portal'}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 28px' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: flex !important; }
        }
        @media (max-width: 767px) {
          .mobile-menu-btn { display: flex !important; }
          main { padding: 20px 16px !important; }
        }
      `}</style>
    </div>
  );
};

export default Layout;