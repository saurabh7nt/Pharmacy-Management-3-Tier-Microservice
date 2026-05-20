import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMedicines } from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

function CustomerHomePage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { notifySuccess, notifyError } = useNotifications();

  useEffect(() => {
    let active = true;

    async function loadFeatured() {
      try {
        const response = await getMedicines({ page: 0, size: 6, category: '' });
        if (active) {
          setMedicines(response.medicines || []);
        }
      } catch (error) {
        if (active) notifyError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFeatured();
    return () => {
      active = false;
    };
  }, [notifyError]);

  function handleAddToCart(medicine) {
    addItem(medicine, 1);
    notifySuccess(`${medicine.name} added to cart.`);
  }

  return (
    <div className="page-section">
      <section className="card customer-hero">
        <div>
          <h1>Order pharmacy essentials online</h1>
          <p className="muted">
            Browse medicines, add items to your cart, register as a customer, and place orders using the existing pharmacy system.
          </p>
          <div className="actions-row">
            <Link className="btn btn-primary" to="/medicines">Browse Medicines</Link>
            <Link className="btn btn-secondary" to="/register">Register as Customer</Link>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <h2>Featured Medicines</h2>
          <Link className="btn btn-ghost" to="/medicines">View All</Link>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading featured medicines..." />
        ) : (
          <div className="grid grid-3">
            {medicines.map((medicine) => (
              <div className="card" key={medicine.id}>
                <h3>{medicine.name}</h3>
                <p className="muted">{medicine.description}</p>
                <div className="helper-text">Category: {medicine.category}</div>
                <div className="helper-text">Manufacturer: {medicine.manufacturer}</div>
                <div className="stat-value" style={{ fontSize: '1.5rem' }}>{formatCurrency(medicine.price)}</div>
                <div className="actions-row">
                  <Link className="btn btn-secondary" to={`/medicines/${medicine.id}`}>View Details</Link>
                  <button className="btn btn-primary" type="button" onClick={() => handleAddToCart(medicine)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default CustomerHomePage;


