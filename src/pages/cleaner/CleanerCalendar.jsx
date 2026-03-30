import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { formatTime } from '../../utils/helpers';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Building2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const cleaningStatusColors = {
  unassigned: '#A08060',
  assigned: '#2D6A8F',
  in_progress: '#C4862D',
  done: '#4A7C59',
};

const CleanerCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await bookingsAPI.getMyAssignments();
        setAllBookings(res.data);
      } catch {
        toast.error('Failed to load schedule');
      } finally {
        setLoadingAll(false);
      }
    };
    fetchAll();
  }, []);

  const getBookingsForDay = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return allBookings.filter(b => b.checkout_date === dateStr);
  };

  const handleDateClick = async (date) => {
    setSelectedDate(date);
    setLoadingDay(true);
    try {
      const formatted = format(date, 'yyyy-MM-dd');
      const res = await bookingsAPI.getMyAssignmentsByDate(formatted);
      setSelectedBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingDay(false);
    }
  };

  const handleStatusUpdate = async (id, cleaning_status) => {
    setUpdatingId(id);
    try {
      await bookingsAPI.updateCleaningStatus(id, cleaning_status);
      setSelectedBookings(selectedBookings.map(b => b.id === id ? { ...b, cleaning_status } : b));
      setAllBookings(allBookings.map(b => b.id === id ? { ...b, cleaning_status } : b));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update');
    } finally {
      setUpdatingId(null);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();

  return (
    <div>
      <div className="animate-fadeUp" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
          ✦ My Schedule
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Cleaning Calendar
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Your assigned checkouts. Click a day to see details and update status.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedDate ? '1fr 340px' : '1fr', gap: '20px', alignItems: 'start' }} className="calendar-grid">

        {/* Calendar */}
        <div className="animate-fadeUp stagger-1" style={{ background: 'var(--ivory)', borderRadius: '24px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid var(--warm-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '600', color: 'var(--espresso)' }}>
                {format(currentMonth, 'MMMM')}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--warm-300)', marginTop: '2px' }}>
                {format(currentMonth, 'yyyy')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[{ icon: ChevronLeft, action: () => setCurrentMonth(subMonths(currentMonth, 1)) },
                { icon: ChevronRight, action: () => setCurrentMonth(addMonths(currentMonth, 1)) }].map(({ icon: Icon, action }, i) => (
                <button key={i} onClick={action} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid var(--warm-200)', background: 'var(--warm-100)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--espresso)', transition: 'all 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
                >
                  <Icon size={17} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '16px 20px 8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--warm-300)', padding: '4px 0' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 20px 24px', gap: '4px' }}>
            {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} />)}
            {days.map((day) => {
              const dayBookings = getBookingsForDay(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const today = isToday(day);
              const hasBookings = dayBookings.length > 0;

              return (
                <button
                  key={day.toString()}
                  onClick={() => handleDateClick(day)}
                  style={{
                    position: 'relative', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-start',
                    padding: '8px 4px 6px', borderRadius: '12px',
                    border: isSelected ? '2px solid var(--terracotta)' : today ? '2px solid var(--warm-200)' : '2px solid transparent',
                    background: isSelected ? 'linear-gradient(135deg, rgba(196,98,45,0.12), rgba(232,146,74,0.06))' : today ? 'var(--warm-100)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.15s', minHeight: '60px',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--warm-100)'; }}
                  onMouseLeave={e => { if (!isSelected && !today) e.currentTarget.style.background = 'transparent'; else if (today && !isSelected) e.currentTarget.style.background = 'var(--warm-100)'; }}
                >
                  <span style={{ fontSize: '14px', fontWeight: isSelected || today ? '600' : '400', color: isSelected ? 'var(--terracotta)' : 'var(--espresso)', lineHeight: 1 }}>
                    {format(day, 'd')}
                  </span>
                  {hasBookings && (
                    <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '5px', maxWidth: '100%' }}>
                      {dayBookings.slice(0, 4).map((b, i) => (
                        <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: cleaningStatusColors[b.cleaning_status] || 'var(--warm-300)', flexShrink: 0 }} />
                      ))}
                      {dayBookings.length > 4 && (
                        <span style={{ fontSize: '8px', fontWeight: '700', color: 'var(--warm-400)', lineHeight: 1, alignSelf: 'center' }}>+{dayBookings.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding: '16px 28px', borderTop: '1px solid var(--warm-100)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--warm-300)', letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: '4px' }}>
              Cleaning Status:
            </p>
            {Object.entries(cleaningStatusColors).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--warm-400)', textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail */}
        {selectedDate && (
          <div className="animate-scaleIn" style={{ background: 'var(--ivory)', borderRadius: '24px', border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', position: 'sticky', top: '20px' }}>
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--warm-100)', background: 'linear-gradient(135deg, rgba(196,98,45,0.06), rgba(232,146,74,0.03))' }}>
              <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '4px' }}>Jobs</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>
                {format(selectedDate, 'EEEE')}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--warm-400)' }}>{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>

            <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {loadingDay ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '28px', height: '28px', border: '2px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : selectedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--espresso)' }}>No jobs</p>
                  <p style={{ fontSize: '13px', color: 'var(--warm-300)', marginTop: '4px' }}>Nothing assigned for this day</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedBookings.map((booking) => (
                    <div key={booking.id} style={{ background: 'var(--cream)', borderRadius: '14px', border: '1px solid var(--warm-100)', padding: '14px', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--espresso)' }}>
                          {booking.properties?.name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={12} color="var(--warm-300)" />
                          <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{booking.properties?.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} color="var(--warm-300)" />
                          <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>Checkout: {formatTime(booking.checkout_time)}</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--warm-400)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Update Cleaning Status
                        </p>
                        <select
                          value={booking.cleaning_status || 'assigned'}
                          onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                          disabled={updatingId === booking.id}
                          style={{
                            width: '100%', fontSize: '13px', fontFamily: 'var(--font-body)',
                            border: '1px solid var(--warm-200)', borderRadius: '8px',
                            padding: '8px 12px', background: 'var(--ivory)',
                            color: 'var(--espresso)', cursor: 'pointer', outline: 'none',
                          }}
                        >
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 767px) { .calendar-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default CleanerCalendar;