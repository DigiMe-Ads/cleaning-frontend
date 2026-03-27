import { useState, useEffect } from 'react';
import { bookingsAPI, propertiesAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Building2, CalendarCheck, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          bookingsAPI.getMyBookings(),
          propertiesAPI.getMyProperties(),
        ]);
        setBookings(bRes.data);
        setProperties(pRes.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcoming = bookings.filter(b => new Date(b.checkout_date) >= new Date());

  const stats = [
    { label: 'Properties', value: properties.length, icon: Building2, color: 'var(--info)' },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'var(--terracotta)' },
    { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'var(--warning)' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: TrendingUp, color: 'var(--success)' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--warm-400)', fontSize: '14px' }}>Loading your dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
          ✦ Client Portal
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Welcome back,{' '}
          <span style={{ fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Here's an overview of your properties and reservations.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className={`animate-fadeUp stagger-${i + 1} card-hover`} style={{
            background: 'var(--ivory)',
            borderRadius: '20px',
            border: '1px solid var(--warm-100)',
            padding: '22px',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0,
              width: '80px', height: '80px',
              background: `${color}12`,
              borderRadius: '0 20px 0 80px',
            }} />
            <div style={{
              width: '38px', height: '38px',
              background: `${color}15`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
              border: `1px solid ${color}20`,
            }}>
              <Icon size={18} color={color} />
            </div>
            <p style={{ fontSize: '32px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--espresso)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '4px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Quick action */}
      {properties.length === 0 && (
        <div className="animate-fadeUp" style={{
          background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
              Add your first property
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              Get started by adding a property and creating your first reservation.
            </p>
          </div>
          <button
            onClick={() => navigate('/client/properties')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 22px',
              background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
              border: 'none', borderRadius: '12px',
              fontSize: '14px', fontWeight: '500', color: 'white',
              cursor: 'pointer', whiteSpace: 'nowrap',
              boxShadow: '0 4px 14px rgba(196,98,45,0.4)',
            }}
          >
            Add Property <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Upcoming checkouts */}
      <div className="animate-fadeUp stagger-5" style={{
        background: 'var(--ivory)',
        borderRadius: '20px',
        border: '1px solid var(--warm-100)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--warm-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>
              Upcoming Checkouts
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>
              {upcoming.length} upcoming reservation{upcoming.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/client/properties')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--warm-100)', border: '1px solid var(--warm-200)',
              borderRadius: '10px', fontSize: '13px', fontWeight: '500',
              color: 'var(--espresso)', cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
          >
            Manage <ArrowRight size={13} />
          </button>
        </div>

        {upcoming.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--espresso)' }}>All clear for now</p>
            <p style={{ fontSize: '13px', color: 'var(--warm-300)', marginTop: '4px' }}>No upcoming checkouts scheduled</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcoming.slice(0, 6).map((booking, i) => (
              <div key={booking.id} style={{
                padding: '18px 24px',
                borderTop: i === 0 ? 'none' : '1px solid var(--warm-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '16px', flexWrap: 'wrap',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    background: 'var(--warm-100)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Building2 size={20} color="var(--terracotta)" />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--espresso)' }}>
                      {booking.properties?.name || 'Unknown property'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>
                      {booking.properties?.location}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', color: 'var(--espresso)', fontWeight: '500' }}>
                      {formatDate(booking.checkout_date)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>
                      {formatTime(booking.checkout_time)}
                    </p>
                  </div>
                  <Badge status={booking.status}>{booking.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClientDashboard;