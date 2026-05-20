import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUsers, searchUsers } from '../api/pharmacyApi';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

function CustomerLoginPage() {
  const navigate = useNavigate();
  const { loginCustomer, currentCustomer } = useCart();
  const { notifySuccess, notifyError } = useNotifications();
  const [form, setForm] = useState({ identifier: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.identifier.trim()) {
      notifyError('Enter username or email to continue.');
      return;
    }

    setLoading(true);
    try {
      const keyword = form.identifier.trim();
      const searchResponse = await searchUsers(keyword, 0, 20);
      let candidates = searchResponse.content || [];

      if (!candidates.length) {
        const allUsers = await getUsers({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' });
        candidates = (allUsers.content || []).filter(
          (user) =>
            user.username?.toLowerCase() === keyword.toLowerCase() ||
            user.email?.toLowerCase() === keyword.toLowerCase()
        );
      }

      const customer = candidates.find(
        (user) =>
          user.role === 'CUSTOMER' &&
          (user.username?.toLowerCase() === keyword.toLowerCase() || user.email?.toLowerCase() === keyword.toLowerCase())
      );

      if (!customer) {
        notifyError('Registered customer not found.');
        return;
      }

      loginCustomer({
        ...customer,
        phoneNumber: customer.phoneNumber || currentCustomer?.phoneNumber || '',
        address: customer.address || currentCustomer?.address || ''
      });
      notifySuccess(`Welcome back, ${customer.firstName || customer.username}.`);
      navigate('/my-orders');
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-section">
      <section className="card customer-auth-card customer-login-card">
        <div className="section-title-row">
          <div>
            <h2>Customer Login</h2>
            <p className="muted">
              Restore your customer session using your username or email. This uses the currently available backend APIs.
            </p>
          </div>
          {currentCustomer ? <span className="badge badge-success">Logged In</span> : null}
        </div>

        <div className="customer-login-grid">
          <div className="customer-login-panel">
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="field-group full-width">
                <label>Username or Email</label>
                <input
                  value={form.identifier}
                  onChange={(e) => setForm({ identifier: e.target.value })}
                  placeholder="customer.neha or neha@example.com"
                />
                <span className="helper-text">Use the same value you used during customer registration.</span>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary customer-btn" type="submit" disabled={loading}>
                  {loading ? 'Signing In...' : 'Login'}
                </button>
                <Link className="btn btn-secondary customer-btn" to="/register">
                  Register Instead
                </Link>
              </div>
            </form>
          </div>

          <div className="customer-login-sidecard">
            <h3>Already registered?</h3>
            <p className="muted">
              Enter your username or email to continue shopping, access checkout faster, and track your orders.
            </p>
            <div className="list">
              <div className="list-item">View order history</div>
              <div className="list-item">Reuse saved customer profile</div>
              <div className="list-item">Proceed to checkout without re-registering</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerLoginPage;


