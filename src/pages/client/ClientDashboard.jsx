import { useState, useEffect } from 'react';
import { bookingsAPI, propertiesAPI } from '../../services/api';
import { formatDate, formatTime } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';
import { Building2, CalendarCheck, CheckCircle, Clock, ArrowRight, ChevronDown, ChevronUp, User, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Group bookings by date then by property
const groupByDateAndProperty = (bookings) => {
  const dateGroups = {};
  bookings.forEach(b => {
    const dateKey = b.checkout_date;
    if (!dateGroups[dateKey]) dateGroups[dateKey] = {};
    const propKey = b.property_id || b.properties?.name || 'unknown';
    if (!dateGroups[dateKey][propKey]) {
      dateGroups[dateKey][propKey] = { property: b.properties, bookings: [] };
    }
    dateGroups[dateKey][propKey].bookings.push(b);
  });
  return Object.entries(dateGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, props]) => ({
      date,
      properties: Object.values(props).sort((a, b) =>
        (a.property?.name || '').localeCompare(b.property?.name || '')
      ),
    }));
};

const csStyles = {
  unassigned: { background: 'var(--warm-100)', color: 'var(--warm-400)', border: '1px solid var(--warm-200)' },
  assigned: { background: 'var(--info-light)', color: 'var(--info)', border: '1px solid rgba(45,106,143,0.25)' },
  in_progress: { background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid rgba(196,134,45,0.25)' },
  done: { background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.25)' },
};

const darkCsStyles = {
  unassigned: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.12)' },
  assigned: { bg: 'rgba(45,106,143,0.3)', color: '#B5D4F4', border: 'rgba(45,106,143,0.4)' },
  in_progress: { bg: 'rgba(196,134,45,0.3)', color: '#FAC775', border: 'rgba(196,134,45,0.4)' },
  done: { bg: 'rgba(74,124,89,0.3)', color: '#9FE1CB', border: 'rgba(74,124,89,0.4)' },
};

const CleaningPill = ({ status, dark = false }) => {
  const s = status || 'unassigned';
  const style = dark ? darkCsStyles[s] : csStyles[s];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: '600',
      textTransform: 'capitalize', whiteSpace: 'nowrap',
      background: dark ? style.bg : style.background,
      color: style.color,
      border: `1px solid ${dark ? style.border : style.border}`,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {s.replace('_', ' ')}
    </span>
  );
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDates, setExpandedDates] = useState({});
  const [expandedProps, setExpandedProps] = useState({});

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

  const toggleDate = (date) => setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));
  const toggleProp = (key) => setExpandedProps(prev => ({ ...prev, [key]: !prev[key] }));

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayBookings = bookings.filter(b => b.checkout_date === today);
  const cleanedToday = todayBookings.filter(b => b.cleaning_status === 'done');
  const pendingToday = todayBookings.filter(b => b.cleaning_status !== 'done');
  const upcoming = bookings.filter(b => new Date(b.checkout_date) >= new Date());
  const grouped = groupByDateAndProperty(upcoming);

  const stats = [
    { label: 'Properties', value: properties.length, icon: Building2, color: 'var(--info)' },
    { label: "Today's Cleanings", value: todayBookings.length, icon: CalendarCheck, color: 'var(--terracotta)' },
    { label: 'Cleaned Today', value: cleanedToday.length, icon: CheckCircle, color: 'var(--success)' },
    { label: 'Pending Today', value: pendingToday.length, icon: Clock, color: pendingToday.length > 0 ? 'var(--warning)' : 'var(--success)' },
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
          Welcome back, <span style={{ fontStyle: 'italic' }}>{user?.name?.split(' ')[0]}</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Here's an overview of your properties and today's cleaning status.
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

      {/* Quick action */}
      {properties.length === 0 && (
        <div className="animate-fadeUp" style={{
          background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))',
          borderRadius: '20px', padding: '28px 32px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>Add your first property</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Get started by adding a property and creating your first reservation.</p>
          </div>
          <button onClick={() => navigate('/client/properties')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px', background: 'linear-gradient(135deg, var(--terracotta), var(--amber))', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '500', color: 'white', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(196,98,45,0.4)' }}>
            Add Property <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Today's cleaning panel */}
      {todayBookings.length > 0 && (
        <div className="animate-fadeUp" style={{
          background: 'linear-gradient(135deg, var(--espresso), var(--mahogany))',
          borderRadius: '20px', padding: '24px 28px', marginBottom: '24px', boxShadow: 'var(--shadow-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '4px' }}>✦ Today's Cleanings</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'white' }}>{format(new Date(), 'EEEE, MMMM d')}</h2>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: 'rgba(74,124,89,0.25)', color: '#9FE1CB', border: '1px solid rgba(74,124,89,0.35)' }}>✓ {cleanedToday.length} done</div>
              {pendingToday.length > 0 && (
                <div style={{ padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: '600', background: 'rgba(196,134,45,0.25)', color: '#FAC775', border: '1px solid rgba(196,134,45,0.35)' }}>⏳ {pendingToday.length} pending</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayBookings.sort((a, b) => a.checkout_time > b.checkout_time ? 1 : -1).map((booking) => {
              const isDone = booking.cleaning_status === 'done';
              const s = darkCsStyles[booking.cleaning_status || 'unassigned'];
              return (
                <div key={booking.id} style={{ padding: '14px 18px', background: isDone ? 'rgba(74,124,89,0.12)' : 'rgba(255,255,255,0.06)', borderRadius: '14px', border: `1px solid ${isDone ? 'rgba(74,124,89,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '36px', height: '36px', flexShrink: 0, background: isDone ? 'rgba(74,124,89,0.25)' : 'rgba(196,98,45,0.22)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${isDone ? 'rgba(74,124,89,0.35)' : 'rgba(232,146,74,0.25)'}` }}>
                        {isDone ? <CheckCircle size={16} color="#9FE1CB" /> : <Building2 size={16} color="var(--amber)" />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: isDone ? 'rgba(255,255,255,0.5)' : 'white', textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {booking.properties?.name}
                        </p>
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>{booking.properties?.location}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: isDone ? '#9FE1CB' : 'var(--amber)', flexShrink: 0 }}>{formatTime(booking.checkout_time)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={11} color="rgba(255,255,255,0.45)" />
                      </div>
                      <p style={{ fontSize: '12px', color: booking.cleaners?.name ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', fontStyle: booking.cleaners?.name ? 'normal' : 'italic' }}>
                        {booking.cleaners?.name || 'No cleaner assigned'}
                      </p>
                    </div>
                    <CleaningPill status={booking.cleaning_status} dark />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming — grouped by date then property */}
      <div className="animate-fadeUp stagger-5" style={{ background: 'var(--ivory)', borderRadius: '20px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>Upcoming Checkouts</h2>
            <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '2px' }}>
              {upcoming.length} reservation{upcoming.length !== 1 ? 's' : ''} across {grouped.length} day{grouped.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={() => navigate('/client/properties')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'var(--warm-100)', border: '1px solid var(--warm-200)', borderRadius: '10px', fontSize: '13px', fontWeight: '500', color: 'var(--espresso)', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
          >
            Manage <ArrowRight size={13} />
          </button>
        </div>

        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌿</div>
            <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--espresso)' }}>All clear for now</p>
            <p style={{ fontSize: '13px', color: 'var(--warm-300)', marginTop: '4px' }}>No upcoming checkouts scheduled</p>
          </div>
        ) : grouped.map(({ date, properties: dateProps }, gi) => {
          const isDateExpanded = expandedDates[date] !== false;
          const isToday = date === today;
          const totalOnDay = dateProps.reduce((sum, p) => sum + p.bookings.length, 0);
          const allDoneOnDay = dateProps.every(p => p.bookings.every(b => b.cleaning_status === 'done'));
          const multipleProps = dateProps.length > 1;

          return (
            <div key={date} style={{ borderTop: gi === 0 ? 'none' : '2px solid var(--warm-200)' }}>

              {/* ── DATE HEADER ── */}
              <div
                onClick={() => multipleProps && toggleDate(date)}
                style={{
                  padding: '12px 24px',
                  background: isToday
                    ? 'linear-gradient(135deg, rgba(196,98,45,0.08), rgba(232,146,74,0.04))'
                    : 'var(--warm-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: multipleProps ? 'pointer' : 'default',
                  borderLeft: isToday ? '3px solid var(--terracotta)' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (multipleProps) e.currentTarget.style.filter = 'brightness(0.97)'; }}
                onMouseLeave={e => { e.currentTarget.style.filter = 'none'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '600',
                    color: isToday ? 'var(--terracotta)' : 'var(--espresso)',
                  }}>
                    {isToday ? 'Today' : format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d')}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--warm-300)' }}>
                    {format(new Date(date + 'T00:00:00'), 'yyyy')}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', background: isToday ? 'rgba(196,98,45,0.12)' : 'var(--warm-200)', color: isToday ? 'var(--terracotta)' : 'var(--warm-500)' }}>
                    {totalOnDay} checkout{totalOnDay !== 1 ? 's' : ''}
                  </span>
                  {allDoneOnDay && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: 'var(--success)' }}>
                      <CheckCircle size={12} color="var(--success)" /> All cleaned
                    </span>
                  )}
                </div>
                {multipleProps && (
                  isDateExpanded
                    ? <ChevronUp size={16} color="var(--warm-300)" />
                    : <ChevronDown size={16} color="var(--warm-300)" />
                )}
              </div>

              {/* ── PROPERTIES UNDER THIS DATE ── */}
              {isDateExpanded && dateProps.map(({ property, bookings: propBookings }, pi) => {
                const propKey = `${date}-${property?.name}`;
                const isPropExpanded = expandedProps[propKey] !== false;
                const allDoneForProp = propBookings.every(b => b.cleaning_status === 'done');
                const hasMultipleBookings = propBookings.length > 1;

                return (
                  <div key={propKey} style={{
                    borderTop: '1px solid var(--warm-100)',
                    marginLeft: '24px',
                    borderLeft: `2px solid ${allDoneForProp ? 'var(--success)' : 'var(--warm-200)'}`,
                  }}>

                    {/* Property header row */}
                    <div
                      onClick={() => hasMultipleBookings && toggleProp(propKey)}
                      style={{
                        padding: '12px 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', flexWrap: 'wrap',
                        background: allDoneForProp ? 'rgba(74,124,89,0.04)' : 'transparent',
                        cursor: hasMultipleBookings ? 'pointer' : 'default',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (hasMultipleBookings) e.currentTarget.style.background = 'var(--cream)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = allDoneForProp ? 'rgba(74,124,89,0.04)' : 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        {/* Property icon */}
                        <div style={{
                          width: '38px', height: '38px', flexShrink: 0,
                          background: allDoneForProp
                            ? 'rgba(74,124,89,0.1)'
                            : 'linear-gradient(135deg, rgba(196,98,45,0.1), rgba(232,146,74,0.06))',
                          borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: `1px solid ${allDoneForProp ? 'rgba(74,124,89,0.2)' : 'rgba(196,98,45,0.15)'}`,
                        }}>
                          {allDoneForProp
                            ? <CheckCircle size={17} color="var(--success)" />
                            : <Building2 size={17} color="var(--terracotta)" />
                          }
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px', fontWeight: '600',
                            color: allDoneForProp ? 'var(--warm-400)' : 'var(--espresso)',
                            textDecoration: allDoneForProp ? 'line-through' : 'none',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {property?.name || 'Unknown property'}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <MapPin size={11} color="var(--warm-300)" />
                            <p style={{ fontSize: '11px', color: 'var(--warm-300)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {property?.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {/* Booking count badge if multiple */}
                        {hasMultipleBookings && (
                          <span style={{ padding: '3px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '600', background: 'rgba(196,98,45,0.1)', color: 'var(--terracotta)', border: '1px solid rgba(196,98,45,0.15)' }}>
                            {propBookings.length} bookings
                          </span>
                        )}
                        {hasMultipleBookings && (
                          isPropExpanded
                            ? <ChevronUp size={14} color="var(--warm-300)" />
                            : <ChevronDown size={14} color="var(--warm-300)" />
                        )}
                      </div>
                    </div>

                    {/* Booking rows under this property */}
                    {isPropExpanded && propBookings
                      .sort((a, b) => a.checkout_time > b.checkout_time ? 1 : -1)
                      .map((booking, bi) => {
                        const isDone = booking.cleaning_status === 'done';
                        return (
                          <div key={booking.id} style={{
                            padding: '10px 20px 10px 68px',
                            borderTop: '1px dashed var(--warm-100)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: '12px', flexWrap: 'wrap',
                            background: isDone ? 'rgba(74,124,89,0.03)' : 'rgba(255,255,255,0.5)',
                            transition: 'background 0.15s',
                          }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                            onMouseLeave={e => e.currentTarget.style.background = isDone ? 'rgba(74,124,89,0.03)' : 'rgba(255,255,255,0.5)'}
                          >
                            {/* Left: time + cleaner */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                              <div style={{
                                padding: '4px 10px', borderRadius: '8px',
                                background: isDone ? 'var(--success-light)' : 'var(--warm-100)',
                                border: `1px solid ${isDone ? 'rgba(74,124,89,0.2)' : 'var(--warm-200)'}`,
                              }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: isDone ? 'var(--success)' : 'var(--espresso)' }}>
                                  {formatTime(booking.checkout_time)}
                                </p>
                              </div>

                              {booking.cleaners?.name ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(45,106,143,0.2)', flexShrink: 0 }}>
                                    <User size={10} color="var(--info)" />
                                  </div>
                                  <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{booking.cleaners.name}</span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--warm-300)', fontStyle: 'italic' }}>No cleaner assigned</span>
                              )}
                            </div>

                            {/* Right: cleaning status */}
                            <CleaningPill status={booking.cleaning_status} />
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ClientDashboard;