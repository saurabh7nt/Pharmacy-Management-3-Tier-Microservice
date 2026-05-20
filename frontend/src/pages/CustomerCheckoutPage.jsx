import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createOrder } from '../api/pharmacyApi';
import { useCart } from '../context/CartContext';
import { paymentMethods } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';
import { useNotifications } from '../context/NotificationContext';

function CustomerCheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart, currentCustomer } = useCart();
  const { notifySuccess, notifyError } = useNotifications();
  const [form, setForm] = useState({
    shippingAddress: currentCustomer?.address || '',
    paymentMethod: 'CREDIT_CARD'
  });
  const [errors, setErrors] = useState({});

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      userId: currentCustomer?.id,
      shippingAddress: form.shippingAddress,
      paymentMethod: form.paymentMethod,
      items: items.map((item) => ({
        medicineId: Number(item.medicineId),
        quantity: Number(item.quantity)
      }))
    };

    const validationErrors = {};
    if (!currentCustomer?.id) {
      validationErrors.userId = 'Please login or register as a customer before checkout.';
    }
    if (!payload.items.length) {
      validationErrors.items = 'Add at least one medicine to the order.';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      await createOrder(payload);
      clearCart();
      notifySuccess('Order placed successfully. Shipping address and payment method are currently handled by the backend defaults.');
      navigate('/my-orders');
    } catch (error) {
      notifyError(error.message);
    }
  }

  if (!items.length) {
    return (
      <div className="page-section">
        <div className="card customer-empty-card">
          <h2>Checkout</h2>
          <p className="muted">Your cart is empty. Add medicines before placing an order.</p>
          <Link className="btn btn-primary customer-btn" to="/medicines">Browse Medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <section className="grid grid-2">
        <div className="card customer-checkout-card">
          <div className="section-title-row">
            <div>
              <h2>Checkout</h2>
              <p className="muted">
                Review your customer details, confirm payment method, and place the order.
              </p>
            </div>
            <span className="badge badge-info">
              {currentCustomer ? `${currentCustomer.firstName} ${currentCustomer.lastName}` : 'Guest'}
            </span>
          </div>

          {errors.userId ? (
            <div className="alert alert-warning">
              {errors.userId} <Link to="/login">Login</Link> or <Link to="/register">Register</Link>.
            </div>
          ) : null}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group full-width">
              <label>Shipping Address</label>
              <textarea
                rows="4"
                value={form.shippingAddress}
                onChange={(e) => setForm((current) => ({ ...current, shippingAddress: e.target.value }))}
                placeholder="Enter full delivery address"
              />
              {errors.shippingAddress ? <span className="error-text">{errors.shippingAddress}</span> : null}
            </div>

            <div className="field-group">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm((current) => ({ ...current, paymentMethod: e.target.value }))}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod ? <span className="error-text">{errors.paymentMethod}</span> : null}
            </div>

            <div className="field-group customer-tip-box">
              <label>Order Note</label>
              <div className="helper-text">Delivery availability depends on medicine stock and service region.</div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary customer-btn" type="submit">Place Order</button>
              <Link className="btn btn-secondary customer-btn" to="/cart">Back to Cart</Link>
            </div>
          </form>
        </div>

        <div className="card customer-summary-card">
          <div className="section-title-row">
            <h3>Order Summary</h3>
            <span className="helper-text">{items.length} items</span>
          </div>

          <div className="list">
            {items.map((item) => (
              <div className="list-item customer-summary-item" key={item.medicineId}>
                <div className="section-title-row">
                  <strong>{item.name}</strong>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
                <div className="muted">Qty: {item.quantity}</div>
                <div className="helper-text">Unit Price: {formatCurrency(item.price)}</div>
              </div>
            ))}
          </div>

          <div className="customer-total-bar">
            <span>Total Payable</span>
            <strong>{formatCurrency(cartTotal)}</strong>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerCheckoutPage;


