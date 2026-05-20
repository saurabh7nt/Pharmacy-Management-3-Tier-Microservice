import { useEffect, useRef, useState } from 'react';
import { getDashboardData } from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDate, isExpiringSoon } from '../utils/formatters';
import { useNotifications } from '../context/NotificationContext';

function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notifyWarning } = useNotifications();
  const hasShownLowStockWarning = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const data = await getDashboardData();
        if (!active) return;
        setDashboard(data);
        if (data.lowStockMedicines.length && !hasShownLowStockWarning.current) {
          notifyWarning(`${data.lowStockMedicines.length} medicines are currently under the low-stock threshold.`);
          hasShownLowStockWarning.current = true;
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, [notifyWarning]);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  if (!dashboard) {
    return <div className="empty-state">No dashboard data available.</div>;
  }

  const statCards = [
    { label: 'Total Users', value: dashboard.stats.totalUsers, subtext: 'Registered across all roles' },
    { label: 'Total Medicines', value: dashboard.stats.totalMedicines, subtext: 'Inventory records available' },
    { label: 'Total Orders', value: dashboard.stats.totalOrders, subtext: 'Orders tracked by the system' },
    { label: 'Low Stock Count', value: dashboard.stats.lowStockCount, subtext: 'Requires replenishment attention' }
  ];

  return (
    <div className="page-section">
      <section className="grid grid-4">
        {statCards.map((card) => (
          <div className="card stat-card" key={card.label}>
            <div className="stat-label">{card.label}</div>
            <div className="stat-value">{card.value}</div>
            <div className="stat-subtext">{card.subtext}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-2">
        <div className="card">
          <div className="section-title-row">
            <h3>Recent Orders</h3>
            <span className="helper-text">Latest 5 orders</span>
          </div>
          <div className="list">
            {dashboard.recentOrders.map((order) => (
              <div className="list-item" key={order.id}>
                <div className="section-title-row">
                  <strong>Order #{order.id}</strong>
                  <StatusBadge value={order.status} />
                </div>
                <div className="muted">User ID: {order.userId}</div>
                <div>Total: {formatCurrency(order.totalAmount)}</div>
                <div>Payment: {order.paymentMethod}</div>
                <div>Placed: {formatDate(order.orderDate)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title-row">
            <h3>Low Stock Medicines</h3>
            <span className="helper-text">Quick-glance replenishment queue</span>
          </div>
          <div className="list">
            {dashboard.lowStockMedicines.map((medicine) => (
              <div className="list-item" key={medicine.id}>
                <div className="section-title-row">
                  <strong>{medicine.name}</strong>
                  <StatusBadge value="LOW_STOCK" />
                </div>
                <div>Stock left: <span className="highlight-danger">{medicine.stockQuantity}</span></div>
                <div>Category: {medicine.category}</div>
                <div>
                  Expiry: {medicine.expiryDate}{' '}
                  {isExpiringSoon(medicine.expiryDate) ? <StatusBadge value="EXPIRING_SOON" /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;


