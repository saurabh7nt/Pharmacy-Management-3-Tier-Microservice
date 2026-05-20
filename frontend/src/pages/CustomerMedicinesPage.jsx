import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMedicines, searchMedicines } from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { formatCurrency } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

function CustomerMedicinesPage() {
  const [data, setData] = useState({ medicines: [], currentPage: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const { addItem } = useCart();
  const { notifySuccess, notifyError } = useNotifications();

  useEffect(() => {
    let active = true;

    async function loadMedicines() {
      setLoading(true);
      try {
        const response = keyword.trim()
          ? { medicines: await searchMedicines(keyword.trim()), currentPage: 0, totalPages: 1 }
          : await getMedicines({ page, size: 9, category });

        if (active) {
          setData(response);
        }
      } catch (error) {
        if (active) notifyError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMedicines();
    return () => {
      active = false;
    };
  }, [page, keyword, category, notifyError]);

  const categories = [...new Set((data.medicines || []).map((medicine) => medicine.category).filter(Boolean))];

  function handleAddToCart(medicine) {
    addItem(medicine, 1);
    notifySuccess(`${medicine.name} added to cart.`);
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="section-title-row">
          <h2>Medicine Catalog</h2>
          <span className="helper-text">Search, browse, and add medicines to your cart.</span>
        </div>

        <div className="toolbar">
          <div className="field-group">
            <label>Search</label>
            <input value={keyword} onChange={(e) => { setPage(0); setKeyword(e.target.value); }} placeholder="Search by name or keyword" />
          </div>

          <div className="field-group">
            <label>Category</label>
            <select value={category} onChange={(e) => { setPage(0); setCategory(e.target.value); }}>
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading medicines..." />
        ) : (
          <>
            <div className="grid grid-3">
              {data.medicines?.map((medicine) => (
                <div className="card" key={medicine.id}>
                  <h3>{medicine.name}</h3>
                  <p className="muted">{medicine.description}</p>
                  <div className="helper-text">Category: {medicine.category}</div>
                  <div className="helper-text">Manufacturer: {medicine.manufacturer}</div>
                  <div className="helper-text">Stock: {medicine.stockQuantity}</div>
                  <div className="stat-value" style={{ fontSize: '1.4rem' }}>{formatCurrency(medicine.price)}</div>
                  <div className="actions-row">
                    <Link className="btn btn-secondary" to={`/medicines/${medicine.id}`}>Details</Link>
                    <button className="btn btn-primary" type="button" onClick={() => handleAddToCart(medicine)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Pagination currentPage={data.currentPage || 0} totalPages={data.totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </section>
    </div>
  );
}

export default CustomerMedicinesPage;


