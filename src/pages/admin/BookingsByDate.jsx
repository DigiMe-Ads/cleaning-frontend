import { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import Badge from '../../components/ui/Badge';
import { formatTime } from '../../utils/helpers';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isToday, isSameMonth, addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Clock, User, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingsByDate = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingDay, setLoadingDay] = useState(false);

  // Load all bookings once to show dots on calendar
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await bookingsAPI.getAllBookings();
        setAllBookings(res.data);
      } catch {
        toast.error('Failed to load bookings');
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
      const res = await bookingsAPI.getByDate(formatted);
      setSelectedBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingDay(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = startOfMonth(currentMonth).getDay();

  const statusColors = {
    pending: '#C4862D',
    confirmed: '#2D6A8F',
    completed: '#4A7C59',
    cancelled: '#B03A2E',
  };

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ marginBottom: '32px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
          ✦ Schedule View
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
          Checkout Calendar
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
          Dots on each day show scheduled checkouts. Click any day for details.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: selectedDate ? '1fr 340px' : '1fr',
        gap: '20px',
        alignItems: 'start',
      }} className="calendar-grid">

        {/* Calendar */}
        <div className="animate-fadeUp stagger-1" style={{
          background: 'var(--ivory)',
          borderRadius: '24px',
          border: '1px solid var(--warm-100)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}>
          {/* Calendar header */}
          <div style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid var(--warm-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '26px', fontWeight: '600',
                color: 'var(--espresso)',
              }}>
                {format(currentMonth, 'MMMM')}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--warm-300)', marginTop: '2px' }}>
                {format(currentMonth, 'yyyy')}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--warm-200)',
                  background: 'var(--warm-100)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--espresso)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
              >
                <ChevronLeft size={17} />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{
                  width: '36px', height: '36px',
                  borderRadius: '10px',
                  border: '1px solid var(--warm-200)',
                  background: 'var(--warm-100)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--espresso)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--warm-200)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--warm-100)'}
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {/* Day names */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            padding: '16px 20px 8px',
          }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{
                textAlign: 'center',
                fontSize: '11px', fontWeight: '600',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: 'var(--warm-300)',
                padding: '4px 0',
              }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            padding: '4px 20px 24px',
            gap: '4px',
          }}>
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}

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
                    position: 'relative',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-start',
                    padding: '8px 4px 6px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid var(--terracotta)'
                      : today
                      ? '2px solid var(--warm-200)'
                      : '2px solid transparent',
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(196,98,45,0.12), rgba(232,146,74,0.06))'
                      : today
                      ? 'var(--warm-100)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    minHeight: '60px',
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--warm-100)';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected && !today) e.currentTarget.style.background = 'transparent';
                    else if (today && !isSelected) e.currentTarget.style.background = 'var(--warm-100)';
                  }}
                >
                  <span style={{
                    fontSize: '14px',
                    fontWeight: isSelected || today ? '600' : '400',
                    color: isSelected
                      ? 'var(--terracotta)'
                      : today
                      ? 'var(--espresso)'
                      : 'var(--espresso)',
                    lineHeight: 1,
                  }}>
                    {format(day, 'd')}
                  </span>

                  {/* Today indicator */}
                  {today && (
                    <span style={{
                      width: '10px', height: '10px',
                      borderRadius: '50%',
                      background: 'var(--terracotta)',
                      marginTop: '3px',
                    }} />
                  )}

                  {/* Booking dots */}
                  {hasBookings && (
                    <div style={{
                      display: 'flex', gap: '2px', flexWrap: 'wrap',
                      justifyContent: 'center',
                      marginTop: today ? '2px' : '5px',
                      maxWidth: '100%',
                    }}>
                      {dayBookings.slice(0, 4).map((b, i) => (
                        <span
                          key={i}
                          title={`${b.properties?.name} — ${b.status}`}
                          style={{
                            width: '6px', height: '6px',
                            borderRadius: '50%',
                            background: statusColors[b.status] || 'var(--warm-300)',
                            flexShrink: 0,
                            animation: 'pulse-dot 2s ease infinite',
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                      ))}
                      {dayBookings.length > 4 && (
                        <span style={{
                          fontSize: '8px', fontWeight: '700',
                          color: 'var(--warm-400)', lineHeight: 1,
                          alignSelf: 'center',
                        }}>+{dayBookings.length - 4}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{
            padding: '16px 28px',
            borderTop: '1px solid var(--warm-100)',
            display: 'flex', gap: '16px', flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--warm-300)', letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: '4px' }}>
              Status:
            </p>
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '11px', color: 'var(--warm-400)', textTransform: 'capitalize' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDate && (
          <div className="animate-scaleIn" style={{
            background: 'var(--ivory)',
            borderRadius: '24px',
            border: '1px solid var(--warm-100)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
            position: 'sticky',
            top: '20px',
          }}>
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--warm-100)',
              background: 'linear-gradient(135deg, rgba(196,98,45,0.06), rgba(232,146,74,0.03))',
            }}>
              <p style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--terracotta)', marginBottom: '4px' }}>
                Checkouts
              </p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '600', color: 'var(--espresso)' }}>
                {format(selectedDate, 'EEEE')}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--warm-400)' }}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>

            <div style={{ padding: '16px', maxHeight: '500px', overflowY: 'auto' }}>
              {loadingDay ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '28px', height: '28px', border: '2px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : selectedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--espresso)' }}>All clear</p>
                  <p style={{ fontSize: '13px', color: 'var(--warm-300)', marginTop: '4px' }}>No checkouts scheduled</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedBookings.map((booking) => (
                    <div key={booking.id} style={{
                      background: 'var(--cream)',
                      borderRadius: '14px',
                      border: '1px solid var(--warm-100)',
                      padding: '14px',
                      transition: 'all 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--espresso)' }}>
                          {booking.properties?.name}
                        </p>
                        <Badge status={booking.status}>{booking.status}</Badge>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} color="var(--warm-300)" />
                          <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{booking.properties?.location}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} color="var(--warm-300)" />
                          <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>
                            Checkout: {formatTime(booking.checkout_time)}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={12} color="var(--warm-300)" />
                          <span style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{booking.users?.name}</span>
                        </div>
                        {booking.notes && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '2px' }}>
                            <FileText size={12} color="var(--warm-300)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: 'var(--warm-400)', fontStyle: 'italic' }}>
                              {booking.notes}
                            </span>
                          </div>
                        )}
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
        @media (max-width: 767px) {
          .calendar-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default BookingsByDate;