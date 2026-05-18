const statusClassMap = {
  PENDING: 'badge-warning',
  CONFIRMED: 'badge-info',
  PROCESSING: 'badge-info',
  SHIPPED: 'badge-info',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
  ADMIN: 'badge-admin',
  CUSTOMER: 'badge-info',
  PHARMACIST: 'badge-success',
  LOW_STOCK: 'badge-danger',
  EXPIRING_SOON: 'badge-warning'
};

function StatusBadge({ value }) {
  const badgeClass = statusClassMap[value] || 'badge-info';

  return <span className={`badge ${badgeClass}`}>{String(value).replaceAll('_', ' ')}</span>;
}

export default StatusBadge;

// Made with Bob
