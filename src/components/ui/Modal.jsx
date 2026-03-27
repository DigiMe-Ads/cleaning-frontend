import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, subtitle, children, width = '480px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(28,20,16,0.55)',
          backdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'relative',
        background: 'var(--ivory)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-xl)',
        animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 28px 20px',
          borderBottom: '1px solid var(--warm-100)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: '16px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: '600',
              color: 'var(--espresso)',
              lineHeight: 1.2,
            }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '13px', color: 'var(--warm-400)', marginTop: '4px' }}>{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              border: '1px solid var(--warm-200)',
              background: 'var(--warm-100)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--warm-400)',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--warm-200)'; e.currentTarget.style.color = 'var(--espresso)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--warm-100)'; e.currentTarget.style.color = 'var(--warm-400)'; }}
          >
            <X size={15} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;