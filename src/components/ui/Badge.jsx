const statusStyles = {
  pending: { background: '#FDF3E3', color: '#C4862D', border: '1px solid rgba(196,134,45,0.25)' },
  confirmed: { background: '#E8F4FB', color: '#2D6A8F', border: '1px solid rgba(45,106,143,0.25)' },
  completed: { background: '#EAF2EC', color: '#4A7C59', border: '1px solid rgba(74,124,89,0.25)' },
  cancelled: { background: '#FDEEEC', color: '#B03A2E', border: '1px solid rgba(176,58,46,0.25)' },
};

const Badge = ({ children, status, style = {} }) => {
  const s = statusStyles[status] || { background: 'var(--warm-100)', color: 'var(--warm-500)', border: '1px solid var(--warm-200)' };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: '600',
      letterSpacing: '0.03em',
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
      ...s,
      ...style,
    }}>
      <span style={{
        width: '5px', height: '5px',
        borderRadius: '50%',
        background: 'currentColor',
        flexShrink: 0,
      }} />
      {children}
    </span>
  );
};

export default Badge;