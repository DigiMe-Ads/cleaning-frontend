import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, Clock, CheckCircle, Building2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const cleaningStatusStyles = {
  unassigned: { background: 'var(--warm-100)', color: 'var(--warm-500)', border: '1px solid var(--warm-200)' },
  assigned: { background: 'var(--info-light)', color: 'var(--info)', border: '1px solid rgba(45,106,143,0.25)' },
  in_progress: { background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid rgba(196,134,45,0.25)' },
  done: { background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.25)' },
};

const CleaningStatusBadge = ({ status }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '99px',
    fontSize: '11px', fontWeight: '600',
    textTransform: 'capitalize',
    ...(cleaningStatusStyles[status] || cleaningStatusStyles.unassigned),
  }}>
    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
    {status?.replace('_', ' ')}
  </span>
);

const CleanerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingsAPI.getMyAssignments();
        setBookings(res.data);
      } catch {
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, cleaning_status) => {
    setUpdatingId(id);
    try {
      await bookingsAPI.updateCleaningStatus(id, cleaning_status);
      setBookings(bookings.map(b => b.id === id ? { ...b, cleaning_status } : b));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.checkout_date === today);
  const upcoming = bookings.filter(b => new Date(b.checkout_date) >= new Date());
  const completed = bookings.filter(b => b.cleaning_status === 'done');

  const stats = [
    { label: 'Total Assigned', value: bookings.length, icon: CalendarCheck, color: 'var(--terracotta)' },
    { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'var(--warning)' },
    { label: 'Today', value: todayBookings.length, icon: Building2, color: 'var(--info)' },
    { label: 'Done', value: completed.length, icon: CheckCircle, color: 'var(--success)' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
          ✦ Cleaner Dashboard
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Here are your assigned properties and today's schedule.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <div key={label} className={`animate-fadeUp stagger-${i + 1} card-hover`} style={{
            background: 'var(--ivory)', borderRadius: '20px',
            border: '1px solid var(--warm-100)', padding: '22px',
            boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `${color}12`, borderRadius: '0 20px 0 80px' }} />
            <div style={{ width: '38px', height: '38px', background: `${color}15`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', border: `1px solid ${color}20` }}>
              <Icon size={18} color={color} />
            </div>
            <p style={{ fontSize: '32px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--espresso)', lineHeight: 1 }}>{value}</p>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '4px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="animate-fadeUp stagger-5" style={{
        background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))',
        borderRadius: '20px', padding: '24px 28px',
        marginBottom: '24px', boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: todayBookings.length > 0 ? '16px' : '0', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '4px' }}>
              ✦ Today's Jobs
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'white' }}>
              {format(new Date(), 'EEEE, MMMM d')}
            </h2>
          </div>
          <div style={{
            padding: '8px 18px',
            background: todayBookings.length > 0 ? 'rgba(196,98,45,0.3)' : 'rgba(255,255,255,0.07)',
            border: `1px solid ${todayBookings.length > 0 ? 'rgba(232,146,74,0.4)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '99px', fontSize: '13px', fontWeight: '500',
            color: todayBookings.length > 0 ? 'var(--amber)' : 'rgba(255,255,255,0.35)',
          }}>
            {todayBookings.length} job{todayBookings.length !== 1 ? 's' : ''} today
          </div>
        </div>

        {todayBookings.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', marginTop: '16px' }}>
            <span style={{ fontSize: '26px' }}>🌿</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.65)' }}>No jobs today</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Enjoy your day off!</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayBookings.sort((a, b) => a.checkout_time > b.checkout_time ? 1 : -1).map((booking) => (
              <div key={booking.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px',
                background: 'rgba(255,255,255,0.06)', borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.08)',
                gap: '12px', flexWrap: 'wrap', transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '40px', height: '40px', flexShrink: 0, background: 'rgba(196,98,45,0.22)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(232,146,74,0.25)' }}>
                    <Building2 size={18} color="var(--amber)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.properties?.name}
                    </p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {booking.properties?.location}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--amber)' }}>
                    {formatTime(booking.checkout_time)}
                  </p>
                  <select
                    value={booking.cleaning_status || 'unassigned'}
                    onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                    disabled={updatingId === booking.id}
                    style={{
                      fontSize: '12px', fontFamily: 'var(--font-body)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '8px', padding: '6px 10px',
                      background: 'rgba(255,255,255,0.1)',
                      color: 'white', cursor: 'pointer', outline: 'none',
                    }}
                  >
                    <option value="assigned" style={{ color: 'black' }}>Assigned</option>
                    <option value="in_progress" style={{ color: 'black' }}>In Progress</option>
                    <option value="done" style={{ color: 'black' }}>Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All assignments */}
      <div style={{ background: 'var(--ivory)', borderRadius: '20px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>
              All Assignments
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>
              {bookings.length} total assignment{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/cleaner/calendar')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', background: 'var(--warm-100)',
              border: '1px solid var(--warm-200)', borderRadius: '10px',
              fontSize: '13px', fontWeight: '500', color: 'var(--espresso)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
          >
            <CalendarCheck size={15} /> My Schedule <ArrowRight size={13} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--warm-100)' }}>
                {['Property', 'Check-out Date', 'Check-out Time', 'Booking Status', 'Cleaning Status'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--warm-400)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-300)', fontSize: '14px' }}>
                    No assignments yet — check back later
                  </td>
                </tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id}
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
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>{formatDate(booking.checkout_date)}</p>
                  </td>
                  <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                    <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>{formatTime(booking.checkout_time)}</p>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge status={booking.status}>{booking.status}</Badge>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <select
                      value={booking.cleaning_status || 'unassigned'}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                      disabled={updatingId === booking.id}
                      style={{
                        fontSize: '12px', fontFamily: 'var(--font-body)',
                        border: '1px solid var(--warm-200)', borderRadius: '8px',
                        padding: '6px 10px', background: 'var(--cream)',
                        color: 'var(--espresso)', cursor: 'pointer', outline: 'none',
                      }}
                    >
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
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

export default CleanerDashboard;