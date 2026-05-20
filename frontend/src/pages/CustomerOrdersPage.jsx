import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPurchaseHistory } from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNotifications } from '../context/NotificationContext';

function CustomerOrdersPage() {
  const { currentCustomer } = useCart();
  const { notifyError } = useNotifications();
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      if (!currentCustomer?.id) return;

      setLoading(true);
      try {
        const startDate = filters.startDate ? new Date(filters.startDate).toISOString() : undefined;
        const endDate = filters.endDate ? new Date(filters.endDate).toISOString() : undefined;
        const response = await getPurchaseHistory(currentCustomer.id, startDate, endDate);
        if (active) {
          setOrders(response || []);
        }
      } catch (error) {
        if (active) notifyError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      active = false;
    };
  }, [currentCustomer, filters.startDate, filters.endDate, notifyError]);

  if (!currentCustomer?.id) {
    return (
      <div className="page-section">
        <div className="card customer-empty-card">
          <h2>My Orders</h2>
          <p className="muted">Login or register as a customer first to view your orders.</p>
          <div className="actions-row">
            <Link className="btn btn-primary customer-btn" to="/login">Login</Link>
            <Link className="btn btn-secondary customer-btn" to="/register">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <section className="card customer-orders-card">
        <div className="section-title-row">
          <div>
            <h2>My Orders</h2>
            <p className="muted">
              Track your pharmacy orders, review payment method, and filter by purchase date.
            </p>
          </div>
          <span className="badge badge-info">
            {currentCustomer.firstName} {currentCustomer.lastName}
          </span>
        </div>

        <div className="toolbar customer-filter-bar">
          <div className="field-group">
            <label>Start Date</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters((current) => ({ ...current, startDate: e.target.value }))} />
          </div>

          <div className="field-group">
            <label>End Date</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters((current) => ({ ...current, endDate: e.target.value }))} />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your orders..." />
        ) : orders.length ? (
          <div className="list customer-orders-list">
            {orders.map((order) => (
              <div className="list-item customer-order-card" key={order.id}>
                <div className="section-title-row">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div className="helper-text">{formatDate(order.orderDate)}</div>
                  </div>
                  <StatusBadge value={order.status} />
                </div>

                <div className="grid grid-3">
                  <div className="customer-metric-box">
                    <span className="helper-text">Total</span>
                    <strong>{formatCurrency(order.totalAmount)}</strong>
                  </div>
                  <div className="customer-metric-box">
                    <span className="helper-text">Payment</span>
                    <strong>{order.paymentMethod}</strong>
                  </div>
                  <div className="customer-metric-box">
                    <span className="helper-text">Shipping</span>
                    <strong>{order.shippingAddress}</strong>
                  </div>
                </div>

                <div className="list customer-order-items">
                  {(order.orderItems || []).map((item) => (
                    <div key={item.id} className="list-item customer-order-item">
                      <div className="section-title-row">
                        <strong>{item.medicineName || `Medicine #${item.medicineId}`}</strong>
                        <strong>{formatCurrency(item.subtotal || item.quantity * item.price)}</strong>
                      </div>
                      <div className="helper-text">Qty: {item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="customer-empty-card">
            <h3>No Orders Found</h3>
            <p className="muted">No orders matched the selected date range.</p>
            <Link className="btn btn-primary customer-btn" to="/medicines">Browse Medicines</Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerOrdersPage;


