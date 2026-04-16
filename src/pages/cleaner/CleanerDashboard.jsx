import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { CalendarCheck, Clock, CheckCircle, Building2, ArrowRight, MapPin } from 'lucide-react';
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
    fontSize: '11px', fontWeight: '600', textTransform: 'capitalize',
    ...(cleaningStatusStyles[status] || cleaningStatusStyles.unassigned),
  }}>
    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
    {status?.replace('_', ' ') || 'unassigned'}
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
      setBookings(bookings.map(b =>
        b.id === id
          ? { ...b, cleaning_status, ...(cleaning_status === 'done' ? { status: 'completed' } : {}) }
          : b
      ));
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
            {todayBookings
              .sort((a, b) => (a.cleaning_time || a.checkout_time) > (b.cleaning_time || b.checkout_time) ? 1 : -1)
              .map((booking) => {
                const isDone = booking.cleaning_status === 'done';
                return (
                  <div key={booking.id} style={{
                    padding: '16px 18px',
                    background: isDone ? 'rgba(74,124,89,0.12)' : 'rgba(255,255,255,0.06)',
                    borderRadius: '14px',
                    border: `1px solid ${isDone ? 'rgba(74,124,89,0.25)' : 'rgba(255,255,255,0.08)'}`,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = isDone ? 'rgba(74,124,89,0.18)' : 'rgba(255,255,255,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = isDone ? 'rgba(74,124,89,0.12)' : 'rgba(255,255,255,0.06)'}
                  >
                    {/* Top row: property info */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{
                          width: '40px', height: '40px', flexShrink: 0,
                          background: isDone ? 'rgba(74,124,89,0.25)' : 'rgba(196,98,45,0.22)',
                          borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${isDone ? 'rgba(74,124,89,0.35)' : 'rgba(232,146,74,0.25)'}`,
                        }}>
                          {isDone
                            ? <CheckCircle size={18} color="#9FE1CB" />
                            : <Building2 size={18} color="var(--amber)" />
                          }
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px', fontWeight: '600',
                            color: isDone ? 'rgba(255,255,255,0.5)' : 'white',
                            textDecoration: isDone ? 'line-through' : 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {booking.properties?.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={10} color="rgba(255,255,255,0.3)" />
                            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {booking.properties?.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Time row */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      marginBottom: '12px', flexWrap: 'wrap',
                    }}>
                      {/* Cleaning time — prominent */}
                      {booking.cleaning_time ? (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 14px', borderRadius: '10px',
                          background: 'rgba(212,168,83,0.2)',
                          border: '1px solid rgba(212,168,83,0.35)',
                          flex: 1,
                        }}>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(212,168,83,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                              🧹 Clean at
                            </p>
                            <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--gold)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                              {formatTime(booking.cleaning_time)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 14px', borderRadius: '10px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px dashed rgba(255,255,255,0.1)',
                          flex: 1,
                        }}>
                          <div>
                            <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                              🧹 Clean at
                            </p>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>Not set</p>
                          </div>
                        </div>
                      )}

                      {/* Checkout time */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '8px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        flex: 1,
                      }}>
                        <div>
                          <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                            🚪 Checkout
                          </p>
                          <p style={{ fontSize: '20px', fontWeight: '700', color: isDone ? 'rgba(255,255,255,0.3)' : 'var(--amber)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                            {formatTime(booking.checkout_time)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: status update */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '12px' }}>
                      <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                        Update cleaning status
                      </p>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['assigned', 'in_progress', 'done'].map((s) => {
                          const isActive = (booking.cleaning_status || 'assigned') === s;
                          const labels = { assigned: 'Assigned', in_progress: 'In Progress', done: '✓ Done' };
                          const activeColors = {
                            assigned: { bg: 'rgba(45,106,143,0.35)', color: '#B5D4F4', border: 'rgba(45,106,143,0.5)' },
                            in_progress: { bg: 'rgba(196,134,45,0.35)', color: '#FAC775', border: 'rgba(196,134,45,0.5)' },
                            done: { bg: 'rgba(74,124,89,0.35)', color: '#9FE1CB', border: 'rgba(74,124,89,0.5)' },
                          };
                          const ac = activeColors[s];
                          return (
                            <button
                              key={s}
                              disabled={updatingId === booking.id}
                              onClick={() => handleStatusUpdate(booking.id, s)}
                              style={{
                                padding: '7px 14px', borderRadius: '8px',
                                fontSize: '12px', fontWeight: '600',
                                cursor: updatingId === booking.id ? 'not-allowed' : 'pointer',
                                border: `1px solid ${isActive ? ac.border : 'rgba(255,255,255,0.1)'}`,
                                background: isActive ? ac.bg : 'rgba(255,255,255,0.05)',
                                color: isActive ? ac.color : 'rgba(255,255,255,0.4)',
                                transition: 'all 0.15s',
                                transform: isActive ? 'scale(1.02)' : 'scale(1)',
                              }}
                              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; } }}
                              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; } }}
                            >
                              {labels[s]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* All assignments table */}
      <div style={{ background: 'var(--ivory)', borderRadius: '20px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>All Assignments</h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>
              {bookings.length} total assignment{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/cleaner/calendar')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--warm-100)', border: '1px solid var(--warm-200)', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: 'var(--espresso)', cursor: 'pointer', transition: 'all 0.2s' }}
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
                {['Property', 'Check-out Date', 'Check-out Time', 'Clean At', 'Cleaning Status'].map(h => (
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
              ) : bookings
                  .sort((a, b) => {
                    const aDate = new Date(`${a.checkout_date}T${a.checkout_time || '00:00'}`);
                    const bDate = new Date(`${b.checkout_date}T${b.checkout_time || '00:00'}`);
                    return aDate - bDate;
                  })
                  .map((booking) => (
                  <tr key={booking.id}
                    style={{ borderTop: '1px solid var(--warm-100)', transition: 'background 0.15s', background: booking.cleaning_status === 'done' ? 'rgba(74,124,89,0.03)' : 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-100)'}
                    onMouseLeave={e => e.currentTarget.style.background = booking.cleaning_status === 'done' ? 'rgba(74,124,89,0.03)' : 'transparent'}
                  >
                    {/* Property */}
                    <td style={{ padding: '16px 20px' }}>
                      <p style={{
                        fontSize: '14px', fontWeight: '500', color: 'var(--espresso)',
                        textDecoration: booking.cleaning_status === 'done' ? 'line-through' : 'none',
                        opacity: booking.cleaning_status === 'done' ? 0.6 : 1,
                      }}>
                        {booking.properties?.name || '—'}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>
                        {booking.properties?.location}
                      </p>
                    </td>

                    {/* Checkout date */}
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>{formatDate(booking.checkout_date)}</p>
                    </td>

                    {/* Checkout time */}
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>{formatTime(booking.checkout_time)}</p>
                    </td>

                    {/* Clean at */}
                    <td style={{ padding: '16px 20px', whiteSpace: 'nowrap' }}>
                      {booking.cleaning_time ? (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          padding: '5px 12px', borderRadius: '8px',
                          background: 'rgba(212,168,83,0.1)',
                          border: '1px solid rgba(212,168,83,0.25)',
                        }}>
                          <span style={{ fontSize: '13px' }}>🧹</span>
                          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gold)' }}>
                            {formatTime(booking.cleaning_time)}
                          </p>
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: 'var(--warm-300)', fontStyle: 'italic' }}>Not set</p>
                      )}
                    </td>

                    {/* Cleaning status */}
                    <td style={{ padding: '16px 20px' }}>
                      <CleaningStatusBadge status={booking.cleaning_status || 'unassigned'} />
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