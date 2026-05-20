import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMedicineById } from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency, isExpiringSoon } from '../utils/formatters';
import StatusBadge from '../components/StatusBadge';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

function CustomerMedicineDetailPage() {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { notifySuccess, notifyError } = useNotifications();

  useEffect(() => {
    let active = true;

    async function loadMedicine() {
      try {
        const response = await getMedicineById(id);
        if (active) {
          setMedicine(response || null);
        }
      } catch (error) {
        if (active) notifyError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMedicine();
    return () => {
      active = false;
    };
  }, [id, notifyError]);

  function handleAddToCart() {
    if (!medicine) return;
    addItem(medicine, Number(quantity));
    notifySuccess(`${medicine.name} added to cart.`);
  }

  if (loading) {
    return <LoadingSpinner label="Loading medicine details..." />;
  }

  if (!medicine) {
    return <div className="empty-state">Medicine not found.</div>;
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="actions-row">
          <Link className="btn btn-ghost" to="/medicines">← Back to Catalog</Link>
        </div>

        <div className="grid grid-2">
          <div className="card">
            <h2>{medicine.name}</h2>
            <p className="muted">{medicine.description}</p>
            <div className="helper-text">Category: {medicine.category}</div>
            <div className="helper-text">Manufacturer: {medicine.manufacturer}</div>
            <div className="helper-text">Stock Available: {medicine.stockQuantity}</div>
            <div className="helper-text">
              Expiry Date: {medicine.expiryDate} {isExpiringSoon(medicine.expiryDate) ? <StatusBadge value="EXPIRING_SOON" /> : null}
            </div>
          </div>

          <div className="card">
            <div className="stat-value">{formatCurrency(medicine.price)}</div>
            <p className="muted">Order this medicine directly from the pharmacy storefront.</p>
            <div className="field-group">
              <label>Quantity</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="actions-row">
              <button className="btn btn-primary" type="button" onClick={handleAddToCart}>
                Add to Cart
              </button>
              <Link className="btn btn-secondary" to="/cart">Go to Cart</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerMedicineDetailPage;


