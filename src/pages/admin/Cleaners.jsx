import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { Plus, Trash2, Pencil, KeyRound, Users, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { parseISO } from 'date-fns';

const Cleaners = () => {
  const [cleaners, setCleaners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCleaner, setSelectedCleaner] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '' });
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { fetchCleaners(); }, []);

  const fetchCleaners = async () => {
    try {
      const res = await usersAPI.getCleaners();
      setCleaners(res.data);
    } catch {
      toast.error('Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersAPI.createCleaner(createForm);
      toast.success('Cleaner account created!');
      setCreateForm({ name: '', email: '', password: '' });
      setShowCreateModal(false);
      fetchCleaners();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create cleaner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await usersAPI.updateCleaner(selectedCleaner.id, editForm);
      toast.success('Cleaner updated!');
      setShowEditModal(false);
      fetchCleaners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cleaner');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await usersAPI.updateCleanerPassword(selectedCleaner.id, newPassword);
      toast.success('Password updated!');
      setNewPassword('');
      setShowPasswordModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}'s account? This cannot be undone.`)) return;
    try {
      await usersAPI.deleteCleaner(id);
      toast.success('Cleaner deleted');
      fetchCleaners();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete cleaner');
    }
  };

  const openEdit = (cleaner) => {
    setSelectedCleaner(cleaner);
    setEditForm({ name: cleaner.name, email: cleaner.email });
    setShowEditModal(true);
  };

  const openPasswordModal = (cleaner) => {
    setSelectedCleaner(cleaner);
    setNewPassword('');
    setShowPasswordModal(true);
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
            ✦ Team Management
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '600', color: 'var(--espresso)', lineHeight: 1.1 }}>
            Cleaners
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--warm-400)', marginTop: '6px' }}>
            {cleaners.length} cleaner{cleaners.length !== 1 ? 's' : ''} on the team
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} style={{ flexShrink: 0 }}>
          <Plus size={16} /> Add Cleaner
        </Button>
      </div>

      {/* Empty state */}
      {cleaners.length === 0 ? (
        <div className="animate-fadeUp stagger-1" style={{
          textAlign: 'center', padding: '80px 32px',
          background: 'var(--ivory)', borderRadius: '24px',
          border: '1px solid var(--warm-100)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ width: '72px', height: '72px', background: 'var(--warm-100)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Users size={32} color="var(--warm-300)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '600', color: 'var(--espresso)', marginBottom: '8px' }}>
            No cleaners yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--warm-400)', maxWidth: '320px', margin: '0 auto 28px' }}>
            Add your first cleaner to start assigning them to reservations.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Add first cleaner
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {cleaners.map((cleaner, i) => (
            <div key={cleaner.id} className={`animate-fadeUp stagger-${Math.min(i + 1, 5)} card-hover`} style={{
              background: 'var(--ivory)',
              borderRadius: '20px',
              border: '1px solid var(--warm-100)',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Cleaner card header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '46px', height: '46px', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--info-light), rgba(45,106,143,0.12))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid rgba(45,106,143,0.2)',
                    fontSize: '18px', fontWeight: '600',
                    color: 'var(--info)',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {cleaner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--espresso)' }}>
                      {cleaner.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <Mail size={11} color="var(--warm-300)" />
                      <p style={{ fontSize: '12px', color: 'var(--warm-400)' }}>{cleaner.email}</p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => openPasswordModal(cleaner)}
                    title="Change password"
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: '1px solid var(--warm-200)', background: 'var(--warm-100)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--warm-400)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--warning-light)'; e.currentTarget.style.color = 'var(--warning)'; e.currentTarget.style.borderColor = 'rgba(196,134,45,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                  >
                    <KeyRound size={13} />
                  </button>
                  <button
                    onClick={() => openEdit(cleaner)}
                    title="Edit cleaner"
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: '1px solid var(--warm-200)', background: 'var(--warm-100)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--warm-400)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--info-light)'; e.currentTarget.style.color = 'var(--info)'; e.currentTarget.style.borderColor = 'rgba(45,106,143,0.25)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(cleaner.id, cleaner.name)}
                    title="Delete cleaner"
                    style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      border: '1px solid var(--warm-200)', background: 'var(--warm-100)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--warm-400)', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'rgba(176,58,46,0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; e.currentTarget.style.borderColor = 'var(--warm-200)'; }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                paddingTop: '14px',
                borderTop: '1px solid var(--warm-100)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '4px 10px', borderRadius: '99px',
                  fontSize: '11px', fontWeight: '600',
                  background: 'var(--info-light)', color: 'var(--info)',
                  border: '1px solid rgba(45,106,143,0.2)',
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor' }} />
                  Cleaner
                </span>
                <p style={{ fontSize: '11px', color: 'var(--warm-300)' }}>
                  Joined {format(parseISO(cleaner.created_at), 'MMM yyyy')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Cleaner Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Cleaner" subtitle="Create a login account for your cleaner">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full name"
            placeholder="e.g. Sarah Johnson"
            icon={User}
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="cleaner@example.com"
            icon={Mail}
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 6 characters"
            icon={KeyRound}
            value={createForm.password}
            onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
            required
          />
          <div style={{
            padding: '12px 14px',
            background: 'var(--info-light)',
            borderRadius: '10px',
            border: '1px solid rgba(45,106,143,0.2)',
            fontSize: '12px', color: 'var(--info)',
          }}>
            ℹ Share these credentials with your cleaner so they can log in to view their assignments.
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} style={{ flex: 1 }}>Create Account</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Cleaner Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Cleaner" subtitle={selectedCleaner?.name}>
        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full name"
            placeholder="Full name"
            icon={User}
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="Email address"
            icon={Mail}
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            required
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} style={{ flex: 1 }}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Change Password Modal */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password" subtitle={selectedCleaner?.name}>
        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="New password"
            type="password"
            placeholder="Min. 6 characters"
            icon={KeyRound}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div style={{
            padding: '12px 14px',
            background: 'var(--warning-light)',
            borderRadius: '10px',
            border: '1px solid rgba(196,134,45,0.2)',
            fontSize: '12px', color: 'var(--warning)',
          }}>
            ⚠ Make sure to share the new password with the cleaner after updating.
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <Button type="button" variant="secondary" style={{ flex: 1 }} onClick={() => setShowPasswordModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} style={{ flex: 1 }}>Update Password</Button>
          </div>
        </form>
      </Modal>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Cleaners;