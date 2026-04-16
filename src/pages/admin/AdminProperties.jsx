import { useState, useEffect } from 'react';
import { propertiesAPI, bookingsAPI, usersAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { formatDate, formatTime } from '../../utils/helpers';
import { Plus, Trash2, MapPin, Calendar, Building2, ChevronRight, Clock, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';

const cleaningStatusStyles = {
  unassigned: { background: 'var(--warm-100)', color: 'var(--warm-400)', border: '1px solid var(--warm-200)' },
  assigned: { background: 'var(--info-light)', color: 'var(--info)', border: '1px solid rgba(45,106,143,0.25)' },
  in_progress: { background: 'var(--warning-light)', color: 'var(--warning)', border: '1px solid rgba(196,134,45,0.25)' },
  done: { background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(74,124,89,0.25)' },
};

const CleaningPill = ({ status }) => {
  const s = status || 'unassigned';
  const style = cleaningStatusStyles[s];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: '600',
      textTransform: 'capitalize', whiteSpace: 'nowrap',
      ...style,
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
      {s.replace('_', ' ')}
    </span>
  );
};

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [propertyBookings, setPropertyBookings] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [propertyForm, setPropertyForm] = useState({ name: '', location: '' });
  const [bookingForm, setBookingForm] = useState({
    checkout_date: '', checkout_time: '', notes: '',
  });
  const [editForm, setEditForm] = useState({
    checkout_date: '', checkout_time: '', notes: '',
    cleaner_id: '', cleaning_time: '', cleaning_status: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        propertiesAPI.getAllProperties(),
        usersAPI.getCleaners(),
      ]);
      setProperties(pRes.data);
      setCleaners(cRes.data);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyBookings = async (propertyId) => {
    try {
      const res = await bookingsAPI.getAllBookings();
      setPropertyBookings(res.data.filter(b => b.property_id === propertyId));
    } catch {
      toast.error('Failed to load reservations');
    }
  };

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await propertiesAPI.create(propertyForm);
      toast.success('Property added!');
      setPropertyForm({ name: '', location: '' });
      setShowPropertyModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookingsAPI.create({
        property_id: selectedProperty.id,
        checkout_date: bookingForm.checkout_date,
        checkout_time: bookingForm.checkout_time,
        notes: bookingForm.notes,
      });
      toast.success('Reservation added!');
      setBookingForm({ checkout_date: '', checkout_time: '', notes: '' });
      fetchPropertyBookings(selectedProperty.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm('Delete this property and all its bookings?')) return;
    try {
      await propertiesAPI.delete(id);
      toast.success('Property deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete property');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!confirm('Delete this reservation?')) return;
    try {
      await bookingsAPI.delete(id);
      toast.success('Reservation deleted');
      fetchPropertyBookings(selectedProperty.id);
    } catch {
      toast.error('Failed to delete reservation');
    }
  };

  const openEdit = (booking) => {
    setEditingBooking(booking.id);
    setEditForm({
      checkout_date: booking.checkout_date || '',
      checkout_time: booking.checkout_time?.slice(0, 5) || '',
      notes: booking.notes || '',
      cleaner_id: booking.cleaner_id || '',
      cleaning_time: booking.cleaning_time?.slice(0, 5) || '',
      cleaning_status: booking.cleaning_status || 'unassigned',
    });
  };

  const handleEditBooking = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await bookingsAPI.update(editingBooking, {
        checkout_date: editForm.checkout_date,
        checkout_time: editForm.checkout_time,
        notes: editForm.notes,
        cleaner_id: editForm.cleaner_id || null,
        cleaning_time: editForm.cleaning_time || null,
        cleaning_status: editForm.cleaning_status,
      });
      toast.success('Reservation updated!');
      setEditingBooking(null);
      fetchPropertyBookings(selectedProperty.id);
    } catch {
      toast.error('Failed to update reservation');
    } finally {
      setUpdating(false);
    }
  };

  const openBookingModal = (property) => {
    setSelectedProperty(property);
    fetchPropertyBookings(property.id);
    setShowBookingModal(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid var(--warm-200)', borderTopColor: 'var(--terracotta)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="animate-fadeUp" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--terracotta)', fontWeight: '500', marginBottom: '8px' }}>
            ✦ Property Management
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
            All Properties
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
            {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} registered
          </p>
        </div>
        <Button onClick={() => setShowPropertyModal(true)} style={{ flexShrink: 0 }}>
          <Plus size={16} /> Add Property
        </Button>
      </div>

      {/* Empty state */}
      {properties.length === 0 ? (
        <div className="animate-fadeUp stagger-1" style={{
          textAlign: 'center', padding: '80px 32px',
          background: 'var(--ivory)', borderRadius: '24px',
          border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--warm-100)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Building2 size={32} color="var(--warm-300)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '600', color: 'var(--espresso)', marginBottom: '8px' }}>
            No properties yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--warm-400)', maxWidth: '320px', margin: '0 auto 28px' }}>
            Add properties to manage their reservations and cleaning schedules.
          </p>
          <Button onClick={() => setShowPropertyModal(true)}>
            <Plus size={16} /> Add first property
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {properties.map((property, i) => (
            <div key={property.id} className={`animate-fadeUp stagger-${Math.min(i + 1, 5)} card-hover`} style={{
              background: 'var(--ivory)', borderRadius: '20px',
              border: '1px solid var(--warm-100)', padding: '24px',
              boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '46px', height: '46px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(196,98,45,0.12), rgba(232,146,74,0.08))',
                    borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(196,98,45,0.15)',
                  }}>
                    <Building2 size={22} color="var(--terracotta)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {property.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <MapPin size={12} color="var(--warm-300)" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: 'var(--warm-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.location}
                      </p>
                    </div>
                    {property.users && (
                      <p style={{ fontSize: '11px', color: 'var(--warm-300)', marginTop: '3px' }}>
                        Owner: {property.users.name}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteProperty(property.id)}
                  style={{
                    width: '30px', height: '30px', flexShrink: 0,
                    borderRadius: '8px', border: '1px solid transparent',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--warm-200)', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(176,58,46,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--warm-200)'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <button
                onClick={() => openBookingModal(property)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', background: 'var(--cream)',
                  border: '1px solid var(--warm-100)', borderRadius: '12px',
                  cursor: 'pointer', width: '100%', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--cream)'; e.currentTarget.style.borderColor = 'var(--warm-100)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={15} color="var(--terracotta)" />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--espresso)' }}>Manage Reservations</span>
                </div>
                <ChevronRight size={15} color="var(--warm-300)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Property Modal */}
      <Modal isOpen={showPropertyModal} onClose={() => setShowPropertyModal(false)} title="Add New Property" subtitle="Enter property details below">
        <form onSubmit={handleCreateProperty} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Property name" placeholder="e.g. Sunset Villa" value={propertyForm.name}
            onChange={(e) => setPropertyForm({ ...propertyForm, name: e.target.value })} required />
          <Input label="Location" placeholder="e.g. 123 Beach Road, Colombo" value={propertyForm.location}
            onChange={(e) => setPropertyForm({ ...propertyForm, location: e.target.value })} required />
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={() => setShowPropertyModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} style={{ flex: 1 }}>Add Property</Button>
          </div>
        </form>
      </Modal>

      {/* Reservations Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => { setShowBookingModal(false); setEditingBooking(null); }}
        title={selectedProperty?.name}
        subtitle={selectedProperty?.location}
        width="580px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Add reservation form */}
          <div style={{ background: 'var(--cream)', borderRadius: '16px', padding: '18px', border: '1px solid var(--warm-100)' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--espresso)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={14} color="var(--terracotta)" /> Add Reservation
            </p>
            <form onSubmit={handleCreateBooking} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Input label="Check-out date" type="date" value={bookingForm.checkout_date}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkout_date: e.target.value })} required />
                <Input label="Check-out time" type="time" value={bookingForm.checkout_time}
                  onChange={(e) => setBookingForm({ ...bookingForm, checkout_time: e.target.value })} required />
              </div>
              <Input label="Notes (optional)" placeholder="Special requests, access codes, etc."
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })} />
              <Button type="submit" loading={submitting} size="sm" style={{ alignSelf: 'flex-start' }}>
                <Plus size={14} /> Add Reservation
              </Button>
            </form>
          </div>

          {/* Existing reservations */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--warm-400)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Existing Reservations ({propertyBookings.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '360px', overflowY: 'auto', paddingRight: '2px' }}>
              {propertyBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px', color: 'var(--warm-300)', fontSize: '14px', background: 'var(--cream)', borderRadius: '12px' }}>
                  No reservations yet
                </div>
              ) : propertyBookings.map((booking) => (
                <div key={booking.id}>
                  {editingBooking !== booking.id ? (
                    /* View mode */
                    <div style={{
                      padding: '14px 16px', background: 'var(--ivory)',
                      border: '1px solid var(--warm-100)', borderRadius: '14px',
                      transition: 'box-shadow 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      {/* Top row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <Badge status={booking.status}>{booking.status}</Badge>
                          <CleaningPill status={booking.cleaning_status} />
                        </div>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button onClick={() => openEdit(booking)} title="Edit"
                            style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid var(--warm-200)', background: 'var(--warm-100)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-400)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--info-light)'; e.currentTarget.style.color = 'var(--info)'; e.currentTarget.style.borderColor = 'rgba(45,106,143,0.25)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteBooking(booking.id)} title="Delete"
                            style={{ width: '28px', height: '28px', borderRadius: '7px', border: '1px solid var(--warm-200)', background: 'var(--warm-100)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warm-400)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(176,58,46,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={11} color="var(--warm-300)" />
                          <p style={{ fontSize: '12px', color: 'var(--warm-400)' }}>
                            Checkout: {formatDate(booking.checkout_date)} at {formatTime(booking.checkout_time)}
                          </p>
                        </div>
                        {booking.cleaning_time && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '11px' }}>🧹</span>
                            <p style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '600' }}>
                              Clean at {formatTime(booking.cleaning_time)}
                            </p>
                          </div>
                        )}
                        {booking.cleaners?.name && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '11px' }}>👤</span>
                            <p style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{booking.cleaners.name}</p>
                          </div>
                        )}
                        {booking.notes && (
                          <p style={{ fontSize: '12px', color: 'var(--warm-300)', fontStyle: 'italic', marginTop: '2px' }}>
                            "{booking.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Edit mode */
                    <div style={{
                      padding: '14px 16px',
                      background: 'var(--info-light)',
                      border: '1.5px solid rgba(45,106,143,0.3)',
                      borderRadius: '14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--info)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Pencil size={11} /> Editing reservation
                        </p>
                        <button onClick={() => setEditingBooking(null)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-400)', display: 'flex', padding: '2px' }}>
                          <X size={14} />
                        </button>
                      </div>
                      <form onSubmit={handleEditBooking} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <Input label="Check-out date" type="date" value={editForm.checkout_date}
                            onChange={(e) => setEditForm({ ...editForm, checkout_date: e.target.value })} required />
                          <Input label="Check-out time" type="time" value={editForm.checkout_time}
                            onChange={(e) => setEditForm({ ...editForm, checkout_time: e.target.value })} required />
                          <Input label="Cleaning time" type="time" value={editForm.cleaning_time}
                            onChange={(e) => setEditForm({ ...editForm, cleaning_time: e.target.value })} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--warm-500)' }}>Cleaning Status</label>
                            <select value={editForm.cleaning_status}
                              onChange={(e) => setEditForm({ ...editForm, cleaning_status: e.target.value })}
                              style={{ padding: '11px 14px', borderRadius: '12px', border: '1.5px solid var(--warm-200)', background: 'var(--warm-100)', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--espresso)', outline: 'none', cursor: 'pointer' }}>
                              <option value="unassigned">Unassigned</option>
                              <option value="assigned">Assigned</option>
                              <option value="in_progress">In Progress</option>
                              <option value="done">Done</option>
                            </select>
                          </div>
                        </div>

                        {/* Assign cleaner */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--warm-500)' }}>Assign Cleaner</label>
                          <select value={editForm.cleaner_id}
                            onChange={(e) => setEditForm({ ...editForm, cleaner_id: e.target.value })}
                            style={{ padding: '11px 14px', borderRadius: '12px', border: '1.5px solid var(--warm-200)', background: 'var(--warm-100)', fontSize: '14px', fontFamily: 'var(--font-body)', color: 'var(--espresso)', outline: 'none', cursor: 'pointer' }}>
                            <option value="">— No cleaner —</option>
                            {cleaners.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>

                        <Input label="Notes" placeholder="Special requests..."
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button type="button" variant="secondary" size="xs" style={{ flex: 1 }} onClick={() => setEditingBooking(null)}>Cancel</Button>
                          <Button type="submit" size="xs" loading={updating} style={{ flex: 1 }}>Save Changes</Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AdminProperties;