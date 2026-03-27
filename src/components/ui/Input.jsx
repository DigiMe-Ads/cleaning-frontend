import { useState } from 'react';

const Input = ({ label, error, hint, icon: Icon, className = '', style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label style={{
          fontSize: '13px',
          fontWeight: '500',
          color: focused ? 'var(--terracotta)' : 'var(--warm-500)',
          transition: 'color 0.2s',
          letterSpacing: '0.01em',
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {Icon && (
          <div style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--terracotta)' : 'var(--warm-300)',
            transition: 'color 0.2s',
            pointerEvents: 'none',
            display: 'flex',
          }}>
            <Icon size={16} />
          </div>
        )}
        <input
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: Icon ? '12px 16px 12px 42px' : '12px 16px',
            fontSize: '14px',
            fontFamily: 'var(--font-body)',
            borderRadius: '12px',
            border: error
              ? '1.5px solid var(--danger)'
              : focused
              ? '1.5px solid var(--terracotta)'
              : '1.5px solid var(--warm-200)',
            background: focused ? 'var(--ivory)' : 'var(--warm-100)',
            color: 'var(--espresso)',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: focused ? '0 0 0 4px rgba(196,98,45,0.08)' : 'none',
            ...style,
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ fontSize: '12px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ⚠ {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ fontSize: '12px', color: 'var(--warm-300)' }}>{hint}</p>
      )}
    </div>
  );
};

export default Input;