export default function Footer() {
  return (
    <footer
      className="w-full py-8 text-center"
      style={{
        background: 'var(--bg-base)',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      <p
        className="text-caption"
        style={{ color: '#55555E' }}
      >
        EquityStream &copy; 2025. All rights reserved.
      </p>
    </footer>
  );
}
