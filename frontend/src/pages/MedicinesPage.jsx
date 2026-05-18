import { useEffect, useMemo, useState } from 'react';
import {
  createMedicine,
  deleteMedicine,
  getLowStockMedicines,
  getMedicines,
  searchMedicines,
  updateMedicine,
  updateMedicineStock
} from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, isExpiringSoon } from '../utils/formatters';
import { validateMedicine } from '../utils/validation';
import { useNotifications } from '../context/NotificationContext';

const initialForm = {
  name: '',
  description: '',
  category: '',
  manufacturer: '',
  price: '',
  stockQuantity: '',
  expiryDate: ''
};

function MedicinesPage() {
  const [medicinesData, setMedicinesData] = useState({ medicines: [], totalPages: 1, currentPage: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState('');
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [stockForm, setStockForm] = useState({ quantity: 0, operation: 'ADD' });
  const [stockMedicine, setStockMedicine] = useState(null);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const { notifyError, notifySuccess, notifyWarning } = useNotifications();

  const categories = useMemo(() => {
    const names = new Set((medicinesData.medicines || []).map((item) => item.category).filter(Boolean));
    return [...names];
  }, [medicinesData]);

  async function loadMedicines(nextPage = page) {
    setLoading(true);
    try {
      const [listResponse, lowStockResponse] = await Promise.all([
        keyword.trim()
          ? Promise.resolve({ medicines: await searchMedicines(keyword.trim()), currentPage: 0, totalPages: 1, totalItems: 0 })
          : getMedicines({ page: nextPage, size: 10, category }),
        getLowStockMedicines(10)
      ]);

      setMedicinesData(listResponse);
      setLowStock(lowStockResponse);
      if (lowStockResponse.length) {
        notifyWarning(`${lowStockResponse.length} medicines need restocking.`);
      }
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedicines(page);
  }, [page, category, keyword]);

  function openMedicineModal(medicine = null) {
    setEditingMedicine(medicine);
    setForm(
      medicine
        ? {
            name: medicine.name || '',
            description: medicine.description || '',
            category: medicine.category || '',
            manufacturer: medicine.manufacturer || '',
            price: medicine.price || '',
            stockQuantity: medicine.stockQuantity || '',
            expiryDate: medicine.expiryDate || ''
          }
        : initialForm
    );
    setErrors({});
    setIsMedicineModalOpen(true);
  }

  function openStockModal(medicine) {
    setStockMedicine(medicine);
    setStockForm({ quantity: 0, operation: 'ADD' });
    setIsStockModalOpen(true);
  }

  async function handleMedicineSubmit(event) {
    event.preventDefault();
    const validationErrors = validateMedicine(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    const payload = {
      ...form,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity)
    };

    try {
      if (editingMedicine) {
        await updateMedicine(editingMedicine.id, payload);
        notifySuccess('Medicine updated successfully.');
      } else {
        await createMedicine(payload);
        notifySuccess('Medicine created successfully.');
      }
      setIsMedicineModalOpen(false);
      loadMedicines(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await deleteMedicine(id);
      notifySuccess('Medicine deleted successfully.');
      loadMedicines(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleStockUpdate(event) {
    event.preventDefault();
    try {
      await updateMedicineStock(stockMedicine.id, {
        quantity: Number(stockForm.quantity),
        operation: stockForm.operation
      });
      notifySuccess('Stock updated successfully.');
      setIsStockModalOpen(false);
      loadMedicines(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  return (
    <div className="page-section">
      <section className="low-stock-banner">
        <strong>Low Stock Alert</strong>
        <span>{lowStock.length} medicines are at or below the configured threshold.</span>
        <div className="actions-row">
          {lowStock.slice(0, 5).map((medicine) => (
            <StatusBadge key={medicine.id} value={`${medicine.name}: ${medicine.stockQuantity}`} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-title-row">
          <h2>Medicine Inventory</h2>
          <button className="btn btn-primary" type="button" onClick={() => openMedicineModal()}>
            Add Medicine
          </button>
        </div>

        <div className="toolbar">
          <div className="field-group">
            <label>Search</label>
            <input value={keyword} onChange={(e) => { setPage(0); setKeyword(e.target.value); }} placeholder="Search medicines" />
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
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Expiry</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicinesData.medicines?.map((medicine) => (
                    <tr key={medicine.id}>
                      <td>
                        <strong>{medicine.name}</strong>
                        <div className="muted">{medicine.description}</div>
                        <div className="muted">{medicine.manufacturer}</div>
                      </td>
                      <td>{medicine.category}</td>
                      <td>{formatCurrency(medicine.price)}</td>
                      <td>
                        <span className={medicine.stockQuantity <= 10 ? 'highlight-danger' : ''}>{medicine.stockQuantity}</span>
                        {medicine.stockQuantity <= 10 ? <StatusBadge value="LOW_STOCK" /> : null}
                      </td>
                      <td>
                        {medicine.expiryDate}
                        {isExpiringSoon(medicine.expiryDate) ? <StatusBadge value="EXPIRING_SOON" /> : null}
                      </td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-secondary" type="button" onClick={() => openMedicineModal(medicine)}>Edit</button>
                          <button className="btn btn-warning" type="button" onClick={() => openStockModal(medicine)}>Update Stock</button>
                          <button className="btn btn-danger" type="button" onClick={() => handleDelete(medicine.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={medicinesData.currentPage || 0} totalPages={medicinesData.totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </section>

      {isMedicineModalOpen ? (
        <Modal title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setIsMedicineModalOpen(false)}>
          <form className="form-grid" onSubmit={handleMedicineSubmit}>
            <div className="field-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              {errors.name ? <span className="error-text">{errors.name}</span> : null}
            </div>

            <div className="field-group">
              <label>Category</label>
              <input value={form.category} onChange={(e) => setForm((current) => ({ ...current, category: e.target.value }))} />
            </div>

            <div className="field-group">
              <label>Manufacturer</label>
              <input value={form.manufacturer} onChange={(e) => setForm((current) => ({ ...current, manufacturer: e.target.value }))} />
            </div>

            <div className="field-group">
              <label>Price</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((current) => ({ ...current, price: e.target.value }))} />
              {errors.price ? <span className="error-text">{errors.price}</span> : null}
            </div>

            <div className="field-group">
              <label>Stock Quantity</label>
              <input type="number" min="0" value={form.stockQuantity} onChange={(e) => setForm((current) => ({ ...current, stockQuantity: e.target.value }))} />
              {errors.stockQuantity ? <span className="error-text">{errors.stockQuantity}</span> : null}
            </div>

            <div className="field-group">
              <label>Expiry Date</label>
              <input type="date" value={form.expiryDate} onChange={(e) => setForm((current) => ({ ...current, expiryDate: e.target.value }))} />
              {errors.expiryDate ? <span className="error-text">{errors.expiryDate}</span> : null}
            </div>

            <div className="field-group full-width">
              <label>Description</label>
              <textarea rows="3" value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">{editingMedicine ? 'Update Medicine' : 'Create Medicine'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setIsMedicineModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {isStockModalOpen ? (
        <Modal title={`Update Stock - ${stockMedicine?.name || ''}`} onClose={() => setIsStockModalOpen(false)}>
          <form className="form-grid" onSubmit={handleStockUpdate}>
            <div className="field-group">
              <label>Operation</label>
              <select value={stockForm.operation} onChange={(e) => setStockForm((current) => ({ ...current, operation: e.target.value }))}>
                <option value="ADD">ADD</option>
                <option value="SUBTRACT">SUBTRACT</option>
              </select>
            </div>

            <div className="field-group">
              <label>Quantity</label>
              <input type="number" min="1" value={stockForm.quantity} onChange={(e) => setStockForm((current) => ({ ...current, quantity: e.target.value }))} />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Apply Stock Update</button>
              <button className="btn btn-secondary" type="button" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default MedicinesPage;

// Made with Bob
