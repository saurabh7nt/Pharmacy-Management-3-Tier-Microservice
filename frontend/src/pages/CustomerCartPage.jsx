import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

function CustomerCartPage() {
  const { items, cartTotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="page-section">
        <div className="card">
          <h2>Your Cart</h2>
          <p className="muted">Your cart is empty.</p>
          <Link className="btn btn-primary" to="/medicines">Browse Medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="section-title-row">
          <h2>Your Cart</h2>
          <button className="btn btn-danger" type="button" onClick={clearCart}>Clear Cart</button>
        </div>

        <div className="list">
          {items.map((item) => (
            <div className="list-item" key={item.medicineId}>
              <div className="section-title-row">
                <strong>{item.name}</strong>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
              <div className="muted">{item.category} • {item.manufacturer}</div>

              <div className="actions-row">
                <div className="field-group" style={{ minWidth: 120 }}>
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.medicineId, e.target.value)}
                  />
                </div>
                <button className="btn btn-danger" type="button" onClick={() => removeItem(item.medicineId)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Cart Summary</h3>
        <div className="stat-value" style={{ fontSize: '1.8rem' }}>{formatCurrency(cartTotal)}</div>
        <div className="actions-row">
          <Link className="btn btn-secondary" to="/medicines">Continue Shopping</Link>
          <Link className="btn btn-primary" to="/checkout">Proceed to Checkout</Link>
        </div>
      </section>
    </div>
  );
}

export default CustomerCartPage;

// Made with Bob
