function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" />
      <div>{label}</div>
    </div>
  );
}

export default LoadingSpinner;

// Made with Bob
