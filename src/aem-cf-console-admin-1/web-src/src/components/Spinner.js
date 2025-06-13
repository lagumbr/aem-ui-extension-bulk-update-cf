const Spinner = ({ size = 40, color = '#1976d2' }) => (
  <div style={{
    display: 'inline-block',
    width: size,
    height: size,
    position: 'relative'
  }}>
    <svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      style={{ animation: 'spin 1s linear infinite' }}
    >
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="90,150"
        strokeDashoffset="0"
      />
    </svg>
    <style>
      {`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

export default Spinner;