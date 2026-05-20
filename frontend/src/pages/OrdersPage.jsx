import { useEffect, useMemo, useState } from 'react';
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  getPurchaseHistory,
  getUsers,
  getMedicines,
  updateOrderStatus
} from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { orderStatuses, paymentMethods } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { validateOrder } from '../utils/validation';
import { useNotifications } from '../context/NotificationContext';

const initialOrderForm = {
  userId: '',
  shippingAddress: '',
  paymentMethod: 'CREDIT_CARD',
  items: []
};

function OrdersPage() {
  const [ordersData, setOrdersData] = useState({ orders: [], totalPages: 1, currentPage: 0 });
  const [users, setUsers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyFilter, setHistoryFilter] = useState({ userId: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState(initialOrderForm);
  const [errors, setErrors] = useState({});
  const { notifyError, notifySuccess } = useNotifications();

  const userOptions = useMemo(() => users.map((user) => ({ value: user.id, label: `${user.firstName} ${user.lastName} (#${user.id})` })), [users]);
  const medicineOptions = useMemo(() => medicines.map((medicine) => ({ value: medicine.id, label: medicine.name, price: medicine.price })), [medicines]);

  async function loadOrders(nextPage = page) {
    setLoading(true);
    try {
      const [ordersResponse, usersResponse, medicinesResponse] = await Promise.all([
        getOrders({ page: nextPage, size: 10, status: statusFilter }),
        getUsers({ page: 0, size: 50, sortBy: 'createdAt', sortDir: 'desc' }),
        getMedicines({ page: 0, size: 50, category: '' })
      ]);

      setOrdersData(ordersResponse);
      setUsers(usersResponse.content || []);
      setMedicines(medicinesResponse.medicines || []);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders(page);
  }, [page, statusFilter]);

  async function handleViewOrder(id) {
    try {
      const details = await getOrderById(id);
      setSelectedOrder(details);
    } catch (error) {
      notifyError(error.message);
    }
  }

  function openCreateModal() {
    setOrderForm(initialOrderForm);
    setErrors({});
    setIsOrderModalOpen(true);
  }

  function addItem() {
    setOrderForm((current) => ({
      ...current,
      items: [...current.items, { medicineId: '', quantity: 1, price: 0 }]
    }));
  }

  function updateItem(index, field, value) {
    setOrderForm((current) => {
      const nextItems = [...current.items];
      nextItems[index] = { ...nextItems[index], [field]: value };

      if (field === 'medicineId') {
        const selectedMedicine = medicineOptions.find((item) => String(item.value) === String(value));
        nextItems[index].price = selectedMedicine?.price || 0;
      }

      return { ...current, items: nextItems };
    });
  }

  function removeItem(index) {
    setOrderForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index)
    }));
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    const payload = {
      ...orderForm,
      userId: Number(orderForm.userId),
      items: orderForm.items.map((item) => ({
        medicineId: Number(item.medicineId),
        quantity: Number(item.quantity)
      }))
    };

    const validationErrors = validateOrder(payload);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      await createOrder(payload);
      notifySuccess('Order created successfully.');
      setIsOrderModalOpen(false);
      loadOrders(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      notifySuccess('Order status updated successfully.');
      loadOrders(page);
      if (selectedOrder?.id === orderId) {
        handleViewOrder(orderId);
      }
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleDelete(orderId) {
    if (!window.confirm('Cancel/delete this order?')) return;
    try {
      await deleteOrder(orderId);
      notifySuccess('Order cancelled successfully.');
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      loadOrders(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleHistoryLookup() {
    if (!historyFilter.userId) {
      notifyError('Select a user to view purchase history.');
      return;
    }

    try {
      const startDate = historyFilter.startDate ? new Date(historyFilter.startDate).toISOString() : undefined;
      const endDate = historyFilter.endDate ? new Date(historyFilter.endDate).toISOString() : undefined;
      const response = await getPurchaseHistory(historyFilter.userId, startDate, endDate);
      setHistory(response);
      setIsHistoryModalOpen(true);
    } catch (error) {
      notifyError(error.message);
    }
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="section-title-row">
          <h2>Orders</h2>
          <div className="actions-row">
            <button className="btn btn-secondary" type="button" onClick={handleHistoryLookup}>View Purchase History</button>
            <button className="btn btn-primary" type="button" onClick={openCreateModal}>Create Order</button>
          </div>
        </div>

        <div className="toolbar">
          <div className="field-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }}>
              <option value="">All statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>User for History</label>
            <select value={historyFilter.userId} onChange={(e) => setHistoryFilter((current) => ({ ...current, userId: e.target.value }))}>
              <option value="">Select user</option>
              {userOptions.map((user) => (
                <option key={user.value} value={user.value}>{user.label}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Start Date</label>
            <input type="date" value={historyFilter.startDate} onChange={(e) => setHistoryFilter((current) => ({ ...current, startDate: e.target.value }))} />
          </div>

          <div className="field-group">
            <label>End Date</label>
            <input type="date" value={historyFilter.endDate} onChange={(e) => setHistoryFilter((current) => ({ ...current, endDate: e.target.value }))} />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>User</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Order Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData.orders?.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>#{order.id}</strong>
                        <div className="muted">{order.shippingAddress}</div>
                      </td>
                      <td>{order.userId}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <StatusBadge value={order.status} />
                        <div style={{ marginTop: 8 }}>
                          <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                            {orderStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td>{order.paymentMethod}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-secondary" type="button" onClick={() => handleViewOrder(order.id)}>View</button>
                          <button className="btn btn-danger" type="button" onClick={() => handleDelete(order.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={ordersData.currentPage || 0} totalPages={ordersData.totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </section>

      {selectedOrder ? (
        <Modal title={`Order Details #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)}>
          <div className="grid grid-2">
            <div className="card">
              <h4>Order Summary</h4>
              <p><strong>Status:</strong> <StatusBadge value={selectedOrder.status} /></p>
              <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
              <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
              <p><strong>Ordered At:</strong> {formatDate(selectedOrder.orderDate)}</p>
            </div>

            <div className="card">
              <h4>Order Items</h4>
              <div className="list">
                {(selectedOrder.orderItems || []).map((item) => (
                  <div className="list-item" key={item.id}>
                    <strong>{item.medicineName || `Medicine #${item.medicineId}`}</strong>
                    <div>Qty: {item.quantity}</div>
                    <div>Price: {formatCurrency(item.price)}</div>
                    <div>Subtotal: {formatCurrency(item.subtotal || item.quantity * item.price)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      ) : null}

      {isOrderModalOpen ? (
        <Modal title="Create Order" onClose={() => setIsOrderModalOpen(false)}>
          <form className="form-grid" onSubmit={handleCreateOrder}>
            <div className="field-group">
              <label>User</label>
              <select value={orderForm.userId} onChange={(e) => setOrderForm((current) => ({ ...current, userId: e.target.value }))}>
                <option value="">Select user</option>
                {userOptions.map((user) => (
                  <option key={user.value} value={user.value}>{user.label}</option>
                ))}
              </select>
              {errors.userId ? <span className="error-text">{errors.userId}</span> : null}
            </div>

            <div className="field-group">
              <label>Payment Method</label>
              <select value={orderForm.paymentMethod} onChange={(e) => setOrderForm((current) => ({ ...current, paymentMethod: e.target.value }))}>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
              {errors.paymentMethod ? <span className="error-text">{errors.paymentMethod}</span> : null}
            </div>

            <div className="field-group full-width">
              <label>Shipping Address</label>
              <textarea rows="3" value={orderForm.shippingAddress} onChange={(e) => setOrderForm((current) => ({ ...current, shippingAddress: e.target.value }))} />
              {errors.shippingAddress ? <span className="error-text">{errors.shippingAddress}</span> : null}
            </div>

            <div className="field-group full-width">
              <div className="section-title-row">
                <label>Order Items</label>
                <button className="btn btn-secondary" type="button" onClick={addItem}>Add Item</button>
              </div>
              {errors.items ? <span className="error-text">{errors.items}</span> : null}
              <div className="list">
                {orderForm.items.map((item, index) => (
                  <div className="list-item" key={`${item.medicineId}-${index}`}>
                    <div className="form-grid">
                      <div className="field-group">
                        <label>Medicine</label>
                        <select value={item.medicineId} onChange={(e) => updateItem(index, 'medicineId', e.target.value)}>
                          <option value="">Select medicine</option>
                          {medicineOptions.map((medicine) => (
                            <option key={medicine.value} value={medicine.value}>{medicine.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="field-group">
                        <label>Quantity</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} />
                      </div>

                      <div className="field-group">
                        <label>Price</label>
                        <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} />
                      </div>

                      <div className="field-group">
                        <label>&nbsp;</label>
                        <button className="btn btn-danger" type="button" onClick={() => removeItem(index)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Create Order</button>
              <button className="btn btn-secondary" type="button" onClick={() => setIsOrderModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {isHistoryModalOpen ? (
        <Modal title="Purchase History" onClose={() => setIsHistoryModalOpen(false)}>
          <div className="list">
            {history.map((order) => (
              <div className="list-item" key={order.id}>
                <div className="section-title-row">
                  <strong>Order #{order.id}</strong>
                  <StatusBadge value={order.status} />
                </div>
                <div>Total: {formatCurrency(order.totalAmount)}</div>
                <div>Payment: {order.paymentMethod}</div>
                <div>Date: {formatDate(order.orderDate)}</div>
              </div>
            ))}
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default OrdersPage;


