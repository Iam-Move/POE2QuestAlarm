function Logo() {
  return (
    <div className="flex items-center gap-3">
      {/* P2 Icon */}
      <div className="logo-icon">
        P2
      </div>
      {/* Quest Navigator Typography */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-title font-bold tracking-wide"
            style={{
              background: 'var(--gradient-gold)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
          Quest Navigator
        </h1>
        <p className="text-xs sm:text-sm font-body tracking-wider"
           style={{ color: 'var(--text-secondary)' }}>
          PATH OF EXILE 2
        </p>
      </div>
    </div>
  );
}

export default Logo;
