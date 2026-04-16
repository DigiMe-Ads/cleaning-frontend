import { useState, useEffect } from 'react';
import { bookingsAPI, propertiesAPI, usersAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/helpers';
import { Building2, CalendarCheck, Clock, CheckCircle, Trash2, ArrowRight, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
  <div className={`animate-fadeUp stagger-${delay} card-hover`} style={{
    background: 'var(--ivory)', borderRadius: '20px',
    border: '1px solid var(--warm-100)', padding: '24px',
    boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '90px', height: '90px', background: `${color}15`, borderRadius: '0 20px 0 90px' }} />
    <div style={{ width: '40px', height: '40px', background: `${color}18`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', border: `1px solid ${color}25` }}>
      <Icon size={19} color={color} />
    </div>
    <p style={{ fontSize: '36px', fontWeight: '600', fontFamily: 'var(--font-display)', color: 'var(--espresso)', lineHeight: 1 }}>{value}</p>
    <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '6px' }}>{label}</p>
  </div>
);

const getBookingStatusStyle = (status) => ({
  pending: { background: '#FDF3E3', color: '#C4862D', border: '1px solid rgba(196,134,45,0.3)' },
  confirmed: { background: '#E8F4FB', color: '#2D6A8F', border: '1px solid rgba(45,106,143,0.3)' },
  completed: { background: '#EAF2EC', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.3)' },
  cancelled: { background: '#FDEEEC', color: '#B03A2E', border: '1px solid rgba(176,58,46,0.3)' },
}[status] || { background: 'var(--warm-100)', color: 'var(--warm-500)', border: '1px solid var(--warm-200)' });

const getCleaningStatusStyle = (status) => ({
  unassigned: { background: 'var(--warm-100)', color: 'var(--warm-500)', border: '1px solid var(--warm-200)' },
  assigned: { background: '#E8F4FB', color: '#2D6A8F', border: '1px solid rgba(45,106,143,0.3)' },
  in_progress: { background: '#FDF3E3', color: '#C4862D', border: '1px solid rgba(196,134,45,0.3)' },
  done: { background: '#EAF2EC', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.3)' },
}[status] || { background: 'var(--warm-100)', color: 'var(--warm-500)', border: '1px solid var(--warm-200)' });

const isOverdue = (booking) => {
  if (!booking.checkout_date) return false;
  if (booking.cleaning_status === 'done') return false;
  if (booking.status === 'cancelled' || booking.status === 'completed') return false;
  return isPast(new Date(`${booking.checkout_date}T${booking.checkout_time || '23:59'}`));
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bRes, pRes, cRes] = await Promise.all([
          bookingsAPI.getAllBookings(),
          propertiesAPI.getAllProperties(),
          usersAPI.getCleaners(),
        ]);
        setBookings(bRes.data);
        setProperties(pRes.data);
        setCleaners(cRes.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCleaningStatusUpdate = async (id, cleaning_status) => {
    try {
      await bookingsAPI.updateCleaningStatus(id, cleaning_status);
      // If done, also silently update booking status to completed in local state
      setBookings(bookings.map(b =>
        b.id === id
          ? { ...b, cleaning_status, ...(cleaning_status === 'done' ? { status: 'completed' } : {}) }
          : b
      ));
      toast.success('Cleaning status updated');
    } catch {
      toast.error('Failed to update cleaning status');
    }
  };

  const handleAssignCleaner = async (id, cleaner_id) => {
    try {
      const cleaningStatus = cleaner_id ? 'assigned' : 'unassigned';
      await bookingsAPI.update(id, {
        cleaner_id: cleaner_id || null,
        cleaning_status: cleaningStatus,
      });
      const assignedCleaner = cleaners.find(c => c.id === cleaner_id) || null;
      setBookings(bookings.map(b =>
        b.id === id
          ? { ...b, cleaner_id: cleaner_id || null, cleaners: assignedCleaner, cleaning_status: cleaningStatus }
          : b
      ));
      toast.success(cleaner_id ? 'Cleaner assigned' : 'Cleaner removed');
    } catch {
      toast.error('Failed to assign cleaner');
    }
  };

  const handleCleaningTimeUpdate = async (id, cleaning_time) => {
    try {
      await bookingsAPI.update(id, { cleaning_time: cleaning_time || null });
      setBookings(bookings.map(b => b.id === id ? { ...b, cleaning_time: cleaning_time || null } : b));
    } catch {
      toast.error('Failed to update cleaning time');
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
  const overdueCount = bookings.filter(isOverdue).length;

  const sortedBookings = [...bookings].sort((a, b) => {
    const aOver = isOverdue(a), bOver = isOverdue(b);
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    return new Date(`${a.checkout_date}T${a.checkout_time || '00:00'}`) - new Date(`${b.checkout_date}T${b.checkout_time || '00:00'}`);
  });

  const stats = [
    { label: 'Total Properties', value: properties.length, icon: Building2, color: 'var(--info)', delay: 1 },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck, color: 'var(--terracotta)', delay: 2 },
    { label: 'Upcoming', value: upcoming.length, icon: Clock, color: 'var(--warning)', delay: 3 },
    { label: overdueCount > 0 ? `${overdueCount} Overdue` : 'Completed', value: overdueCount > 0 ? overdueCount : bookings.filter(b => b.status === 'completed').length, icon: overdueCount > 0 ? AlertTriangle : CheckCircle, color: overdueCount > 0 ? 'var(--danger)' : 'var(--success)', delay: 4 },
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
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>✦ Admin Dashboard</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span style={{ fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>Here's what's happening across all properties today.</p>
      </div>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', marginBottom: '24px', background: 'var(--danger-light)', border: '1px solid rgba(176,58,46,0.25)', borderRadius: '14px' }}>
          <AlertTriangle size={18} color="var(--danger)" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '14px', color: 'var(--danger)', fontWeight: '500' }}>
            {overdueCount} booking{overdueCount !== 1 ? 's are' : ' is'} overdue and not marked as done.
          </p>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Today's Schedule */}
      <div className="animate-fadeUp stagger-5" style={{ background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))', borderRadius: '20px', padding: '24px 28px', marginBottom: '24px', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: todayBookings.length > 0 ? '16px' : '0', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '4px' }}>✦ Today's Schedule</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'white' }}>{format(new Date(), 'EEEE, MMMM d')}</h2>
          </div>
          <div style={{ padding: '8px 18px', background: todayBookings.length > 0 ? 'rgba(196,98,45,0.3)' : 'rgba(255,255,255,0.07)', border: `1px solid ${todayBookings.length > 0 ? 'rgba(232,146,74,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '99px', fontSize: '13px', fontWeight: '500', color: todayBookings.length > 0 ? 'var(--amber)' : 'rgba(255,255,255,0.35)' }}>
            {todayBookings.length} checkout{todayBookings.length !== 1 ? 's' : ''} today
          </div>
        </div>

        {todayBookings.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: 'rgba(255,255,255,0.04)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.07)', marginTop: '16px' }}>
            <span style={{ fontSize: '26px' }}>🌿</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.65)' }}>All clear for today</p>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>No checkouts scheduled</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayBookings.sort((a, b) => a.checkout_time > b.checkout_time ? 1 : -1).map((booking) => {
              const overdue = isOverdue(booking);
              return (
                <div key={booking.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: overdue ? 'rgba(176,58,46,0.2)' : 'rgba(255,255,255,0.06)', borderRadius: '14px', border: `1px solid ${overdue ? 'rgba(176,58,46,0.35)' : 'rgba(255,255,255,0.08)'}`, gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div style={{ width: '40px', height: '40px', flexShrink: 0, background: overdue ? 'rgba(176,58,46,0.3)' : 'rgba(196,98,45,0.22)', borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${overdue ? 'rgba(176,58,46,0.4)' : 'rgba(232,146,74,0.25)'}` }}>
                      {overdue ? <AlertTriangle size={18} color="#F09595" /> : <Building2 size={18} color="var(--amber)" />}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{booking.properties?.name}</p>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', marginTop: '2px' }}>
                        {overdue ? '⚠ Overdue' : booking.properties?.location}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: overdue ? '#F09595' : 'var(--amber)' }}>{formatTime(booking.checkout_time)}</p>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{booking.cleaners?.name || 'Unassigned'}</p>
                    </div>
                    {booking.cleaning_time && (
                      <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(212,168,83,0.2)', border: '1px solid rgba(212,168,83,0.3)' }}>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gold)' }}>🧹 {formatTime(booking.cleaning_time)}</p>
                      </div>
                    )}
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', textTransform: 'capitalize', whiteSpace: 'nowrap', ...(() => { const s = { unassigned: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.12)' }, assigned: { background: 'rgba(45,106,143,0.3)', color: '#B5D4F4', border: '1px solid rgba(45,106,143,0.4)' }, in_progress: { background: 'rgba(196,134,45,0.3)', color: '#FAC775', border: '1px solid rgba(196,134,45,0.4)' }, done: { background: 'rgba(74,124,89,0.3)', color: '#9FE1CB', border: '1px solid rgba(74,124,89,0.4)' } }; return s[booking.cleaning_status || 'unassigned']; })() }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                      {(booking.cleaning_status || 'unassigned').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Bookings Table */}
      <div style={{ background: 'var(--ivory)', borderRadius: '20px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>All Bookings</h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>Sorted by next upcoming — overdue shown first</p>
          </div>
          <button onClick={() => navigate('/admin/calendar')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--warm-100)', border: '1px solid var(--warm-200)', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: 'var(--espresso)', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
          >
            <CalendarCheck size={15} /> Calendar View <ArrowRight size={13} />
          </button>
        </div>

        {/* Mobile cards */}
        <div className="mobile-booking-cards">
          {sortedBookings.map((booking) => {
            const overdue = isOverdue(booking);
            return (
              <div key={`m-${booking.id}`} style={{ padding: '16px 20px', borderTop: '1px solid var(--warm-100)', background: overdue ? 'rgba(176,58,46,0.04)' : 'transparent', borderLeft: overdue ? '3px solid var(--danger)' : '3px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {overdue && <AlertTriangle size={13} color="var(--danger)" />}
                      <p style={{ fontSize: '14px', fontWeight: '600', color: overdue ? 'var(--danger)' : 'var(--espresso)' }}>{booking.properties?.name || '—'}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>{booking.properties?.location}</p>
                    <p style={{ fontSize: '12px', color: 'var(--warm-400)', marginTop: '4px' }}>
                      {booking.users?.name} · Checkout {formatDate(booking.checkout_date)} {formatTime(booking.checkout_time)}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(booking.id)} style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-200)', transition: 'all 0.15s', flexShrink: 0 }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--warm-200)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--warm-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Cleaning Status</p>
                    <select value={booking.cleaning_status || 'unassigned'} onChange={(e) => handleCleaningStatusUpdate(booking.id, e.target.value)}
                      style={{ width: '100%', fontSize: '12px', fontFamily: 'var(--font-body)', borderRadius: '99px', padding: '6px 10px', cursor: 'pointer', outline: 'none', fontWeight: '600', appearance: 'none', textAlign: 'center', ...getCleaningStatusStyle(booking.cleaning_status || 'unassigned') }}>
                      <option value="unassigned">Unassigned</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--warm-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Cleaning Time</p>
                    <input type="time" value={booking.cleaning_time?.slice(0, 5) || ''} onChange={(e) => handleCleaningTimeUpdate(booking.id, e.target.value)}
                      style={{ width: '100%', fontSize: '12px', fontFamily: 'var(--font-body)', border: '1px solid var(--warm-200)', borderRadius: '8px', padding: '6px 8px', background: 'var(--cream)', color: 'var(--espresso)', outline: 'none', cursor: 'pointer' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '10px', fontWeight: '600', color: 'var(--warm-300)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Assign Cleaner</p>
                    <select value={booking.cleaner_id || ''} onChange={(e) => handleAssignCleaner(booking.id, e.target.value)}
                      style={{ width: '100%', fontSize: '12px', fontFamily: 'var(--font-body)', border: '1px solid var(--warm-200)', borderRadius: '8px', padding: '6px 8px', background: 'var(--cream)', color: booking.cleaner_id ? 'var(--espresso)' : 'var(--warm-300)', cursor: 'pointer', outline: 'none' }}>
                      <option value="">— No cleaner —</option>
                      {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop table */}
        <div className="desktop-booking-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--warm-100)' }}>
                {['', 'Property', 'Client', 'Checkout', 'Assign Cleaner', 'Cleaning Time', 'Cleaning Status', ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--warm-400)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedBookings.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '60px', color: 'var(--warm-300)', fontSize: '14px' }}>No bookings yet</td></tr>
              ) : sortedBookings.map((booking) => {
                const overdue = isOverdue(booking);
                return (
                  <tr key={booking.id}
                    style={{ borderTop: '1px solid var(--warm-100)', background: overdue ? 'rgba(176,58,46,0.04)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = overdue ? 'rgba(176,58,46,0.08)' : 'var(--warm-100)'}
                    onMouseLeave={e => e.currentTarget.style.background = overdue ? 'rgba(176,58,46,0.04)' : 'transparent'}
                  >
                    {/* Overdue indicator */}
                    <td style={{ padding: '16px 8px 16px 16px', width: '24px' }}>
                      {overdue && <div title="Overdue"><AlertTriangle size={15} color="var(--danger)" /></div>}
                    </td>

                    {/* Property */}
                    <td style={{ padding: '16px 16px' }}>
                      <p style={{ fontSize: '14px', fontWeight: '500', color: overdue ? 'var(--danger)' : 'var(--espresso)' }}>{booking.properties?.name || '—'}</p>
                      <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>{booking.properties?.location}</p>
                    </td>

                    {/* Client */}
                    <td style={{ padding: '16px 16px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--espresso)' }}>{booking.users?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--warm-300)', marginTop: '2px' }}>{booking.users?.email}</p>
                    </td>

                    {/* Checkout */}
                    <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontSize: '13px', fontWeight: '500', color: overdue ? 'var(--danger)' : 'var(--espresso)' }}>{formatDate(booking.checkout_date)}</p>
                      <p style={{ fontSize: '12px', color: 'var(--warm-300)', marginTop: '2px' }}>{formatTime(booking.checkout_time)}</p>
                    </td>

                    {/* Assign cleaner */}
                    <td style={{ padding: '16px 16px' }}>
                      <select value={booking.cleaner_id || ''} onChange={(e) => handleAssignCleaner(booking.id, e.target.value)}
                        style={{ fontSize: '12px', fontFamily: 'var(--font-body)', border: '1px solid var(--warm-200)', borderRadius: '8px', padding: '6px 10px', background: 'var(--cream)', color: booking.cleaner_id ? 'var(--espresso)' : 'var(--warm-300)', cursor: 'pointer', outline: 'none', maxWidth: '140px' }}>
                        <option value="">— Unassigned —</option>
                        {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>

                    {/* Cleaning time picker */}
                    <td style={{ padding: '16px 16px' }}>
                      <input
                        type="time"
                        value={booking.cleaning_time?.slice(0, 5) || ''}
                        onChange={(e) => handleCleaningTimeUpdate(booking.id, e.target.value)}
                        style={{
                          fontSize: '12px', fontFamily: 'var(--font-body)',
                          border: `1px solid ${booking.cleaning_time ? 'rgba(212,168,83,0.4)' : 'var(--warm-200)'}`,
                          borderRadius: '8px', padding: '6px 10px',
                          background: booking.cleaning_time ? 'rgba(212,168,83,0.08)' : 'var(--cream)',
                          color: booking.cleaning_time ? 'var(--espresso)' : 'var(--warm-300)',
                          cursor: 'pointer', outline: 'none', width: '110px',
                        }}
                      />
                    </td>

                    {/* Cleaning status */}
                    <td style={{ padding: '16px 16px' }}>
                      <select value={booking.cleaning_status || 'unassigned'} onChange={(e) => handleCleaningStatusUpdate(booking.id, e.target.value)}
                        style={{ fontSize: '12px', fontFamily: 'var(--font-body)', borderRadius: '99px', padding: '6px 12px', cursor: 'pointer', outline: 'none', fontWeight: '600', letterSpacing: '0.02em', appearance: 'none', textAlign: 'center', ...getCleaningStatusStyle(booking.cleaning_status || 'unassigned') }}>
                        <option value="unassigned">Unassigned</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>

                    {/* Delete */}
                    <td style={{ padding: '16px 16px' }}>
                      <button onClick={() => handleDelete(booking.id)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid transparent', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-300)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(176,58,46,0.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--warm-300)'; e.currentTarget.style.borderColor = 'transparent'; }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .mobile-booking-cards { display: none; }
        .desktop-booking-table { display: block; }
        @media (max-width: 900px) {
          .mobile-booking-cards { display: block; }
          .desktop-booking-table { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;