const variants = {
  primary: {
    background: 'linear-gradient(135deg, var(--terracotta), var(--amber))',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 14px rgba(196,98,45,0.35)',
  },
  secondary: {
    background: 'var(--warm-100)',
    color: 'var(--espresso)',
    border: '1px solid var(--warm-200)',
    boxShadow: 'none',
  },
  outline: {
    background: 'transparent',
    color: 'var(--terracotta)',
    border: '1.5px solid var(--terracotta)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--warm-400)',
    border: 'none',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--danger-light)',
    color: 'var(--danger)',
    border: '1px solid rgba(176,58,46,0.2)',
    boxShadow: 'none',
  },
  dark: {
    background: 'var(--espresso)',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 14px rgba(28,20,16,0.3)',
  },
};

const sizes = {
  xs: { padding: '6px 12px', fontSize: '12px', borderRadius: '8px' },
  sm: { padding: '8px 16px', fontSize: '13px', borderRadius: '10px' },
  md: { padding: '11px 22px', fontSize: '14px', borderRadius: '12px' },
  lg: { padding: '14px 28px', fontSize: '15px', borderRadius: '14px' },
};

const Button = ({ children, variant = 'primary', size = 'md', loading = false, className = '', style = {}, ...props }) => {
  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontFamily: 'var(--font-body)',
        fontWeight: '500',
        cursor: props.disabled || loading ? 'not-allowed' : 'pointer',
        opacity: props.disabled || loading ? 0.6 : 1,
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        ...v,
        ...s,
        ...style,
      }}
      onMouseEnter={e => {
        if (!props.disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.05)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <div style={{
          width: '14px', height: '14px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      )}
      {children}
    </button>
  );
};

export default Button;