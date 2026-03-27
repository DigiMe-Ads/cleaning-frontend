import { useState, useEffect } from 'react';
import { bookingsAPI, propertiesAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/helpers';
import { Building2, CalendarCheck, Clock, CheckCircle, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <div className={`animate-fadeUp stagger-${delay} card-hover`} style={{
    background: 'var(--ivory)',
    borderRadius: '20px',
    border: '1px solid var(--warm-100)',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{
      position: 'absolute', top: 0, right: 0,
      width: '90px', height: '90px',
      background: `${color}15`,
      borderRadius: '0 20px 0 90px',
    }} />
    <div style={{
      width: '40px', height: '40px',
      background: `${color}18`,
      borderRadius: '12px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '16px',
      border: `1px solid ${color}25`,
    }}>
      <Icon size={19} color={color} />
    </div>
    <p style={{
      fontSize: '36px', fontWeight: '600',
      fontFamily: 'var(--font-display)',
      color: 'var(--espresso)', lineHeight: 1,
    }}>{value}</p>
    <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '6px' }}>{label}</p>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes] = await Promise.all([
          bookingsAPI.getAllBookings(),
          propertiesAPI.getAllProperties(),
        ]);
        setBookings(bRes.data);
        setProperties(pRes.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingsAPI.update(id, { status });
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this booking?')) return;
    try {
      await bookingsAPI.delete(id);
      setBookings(bookings.filter(b => b.id !== id));
      toast.success('Booking deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.checkout_date === today);
  const upcoming = bookings.filter(b => new Date(b.checkout_date) >= new Date());

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'var(--info)', delay: 1 },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'var(--terracotta)', delay: 2 },
    { label: 'Upcoming Checkouts', value: upcoming.length, icon: Clock, color: 'var(--warning)', delay: 3 },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: CheckCircle, color: 'var(--success)', delay: 4 },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--warm-400)', fontSize: '14px' }}>Loading dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
          ✦ Admin Dashboard
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Here's what's happening across all properties today.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Today's Schedule Panel */}
      <div className="animate-fadeUp stagger-5" style={{
        background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))',
        borderRadius: '20px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* Panel header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: todayBookings.length > 0 ? '16px' : '0',
          flexWrap: 'wrap', gap: '10px',
        }}>
          <div>
            <p style={{
              fontSize: '11px', fontWeight: '600',
              letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--amber)', marginBottom: '4px',
            }}>
              ✦ Today's Schedule
            </p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px', fontWeight: '600',
              color: 'white',
            }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </h2>
          </div>
          <div style={{
            padding: '8px 18px',
            background: todayBookings.length > 0
              ? 'rgba(196,98,45,0.3)'
              : 'rgba(255,255,255,0.07)',
            border: `1px solid ${todayBookings.length > 0
              ? 'rgba(232,146,74,0.4)'
              : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '99px',
            fontSize: '13px', fontWeight: '500',
            color: todayBookings.length > 0 ? 'var(--amber)' : 'rgba(255,255,255,0.35)',
          }}>
            {todayBookings.length} checkout{todayBookings.length !== 1 ? 's' : ''} today
          </div>
        </div>

        {/* Empty state */}
        {todayBookings.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '18px 20px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '14px',
            border: '1px solid rgba(255,255,255,0.07)',
            marginTop: '16px',
          }}>
            <span style={{ fontSize: '26px' }}>🌿</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.65)' }}>
                All clear for today
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                No checkouts scheduled
              </p>
            </div>
          </div>
        ) : (
          /* Booking cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayBookings
              .sort((a, b) => (a.checkout_time > b.checkout_time ? 1 : -1))
              .map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    gap: '12px', flexWrap: 'wrap',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                >
                  {/* Left: icon + property info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '40px', height: '40px', flexShrink: 0,
                      background: 'rgba(196,98,45,0.22)',
                      borderRadius: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1px solid rgba(232,146,74,0.25)',
                    }}>
                      <Building2 size={18} color="var(--amber)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontSize: '14px', fontWeight: '500', color: 'white',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {booking.properties?.name}
                      </p>
                      <p style={{
                        fontSize: '12px', color: 'rgba(255,255,255,0.38)',
                        marginTop: '2px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {booking.properties?.location}
                      </p>
                    </div>
                  </div>

                  {/* Right: time + client + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--amber)' }}>
                        {formatTime(booking.checkout_time)}
                      </p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
                        {booking.users?.name}
                      </p>
                    </div>
                    <Badge status={booking.status}>{booking.status}</Badge>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* All Bookings table */}
      <div style={{
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
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>
              All Bookings
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>
              {bookings.length} total reservation{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/calendar')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px',
              background: 'var(--warm-100)',
              border: '1px solid var(--warm-200)',
              borderRadius: '10px',
              fontSize: '13px', fontWeight: '500',
              color: 'var(--espresso)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
          >
            <CalendarCheck size={15} /> Calendar View <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--warm-100)' }}>
                {['Property', 'Client', 'Check-out Date', 'Check-out Time', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: '11px', fontWeight: '600',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: 'var(--warm-400)', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-300)', fontSize: '14px' }}>
                    No bookings yet
                  </td>
                </tr>
              ) : bookings.map((booking) => (
                <tr
                  key={booking.id}
                  style={{ borderTop: '1px solid var(--warm-100)', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-100)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--espresso)' }}>
                      {booking.properties?.name || '—'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>
                      {booking.properties?.location}
                    </p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--espresso)' }}>{booking.users?.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>{booking.users?.email}</p>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>
                      {formatDate(booking.checkout_date)}
                    </p>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>
                      {formatTime(booking.checkout_time)}
                    </p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      style={{
                        fontSize: '12px', fontFamily: 'var(--font-body)',
                        border: '1px solid var(--warm-200)',
                        borderRadius: '8px', padding: '6px 10px',
                        background: 'var(--cream)', color: 'var(--espresso)',
                        cursor: 'pointer', outline: 'none',
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      style={{
                        width: '32px', height: '32px',
                        borderRadius: '8px',
                        border: '1px solid transparent',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--warm-300)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(176,58,46,0.2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--warm-300)'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminDashboard;