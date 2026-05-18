import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import MedicinesPage from './pages/MedicinesPage';
import OrdersPage from './pages/OrdersPage';
import CustomerHomePage from './pages/CustomerHomePage';
import CustomerMedicinesPage from './pages/CustomerMedicinesPage';
import CustomerMedicineDetailPage from './pages/CustomerMedicineDetailPage';
import CustomerRegisterPage from './pages/CustomerRegisterPage';
import CustomerLoginPage from './pages/CustomerLoginPage';
import CustomerCartPage from './pages/CustomerCartPage';
import CustomerCheckoutPage from './pages/CustomerCheckoutPage';
import CustomerOrdersPage from './pages/CustomerOrdersPage';
import NotificationContainer from './components/NotificationContainer';
import { useCart } from './context/CartContext';
import { getUsers } from './api/pharmacyApi';
import { useNotifications } from './context/NotificationContext';

function CustomerLayout() {
  const { itemCount, currentCustomer, clearCurrentCustomer } = useCart();

  return (
    <div className="customer-shell">
      <header className="customer-header">
        <div>
          <div className="brand customer-brand">Pharmacy Store</div>
          <div className="sidebar-subtitle customer-subtitle">Online medicine ordering experience</div>
        </div>

        <nav className="nav-menu nav-menu-inline">
          <NavLink to="/" end className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/medicines" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Medicines
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Cart ({itemCount})
          </NavLink>
          <NavLink to="/checkout" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Checkout
          </NavLink>
          <NavLink to="/my-orders" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            My Orders
          </NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            {currentCustomer ? 'Account' : 'Login'}
          </NavLink>
          <NavLink to="/register" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Register
          </NavLink>
          {currentCustomer ? (
            <button className="btn btn-ghost customer-btn" type="button" onClick={clearCurrentCustomer}>
              Logout
            </button>
          ) : null}
          <NavLink to="/admin-login" className={({ isActive }) => `nav-link customer-nav-link ${isActive ? 'active' : ''}`}>
            Admin
          </NavLink>
        </nav>
      </header>

      <main className="customer-main">
        <Outlet />
      </main>
    </div>
  );
}

const adminNavItems = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/medicines', label: 'Medicines' },
  { to: '/admin/orders', label: 'Orders' }
];

function AdminLayout() {
  const { clearCurrentAdmin } = useCart();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand">Pharmacy Admin</div>
          <p className="sidebar-subtitle">Internal operations dashboard</p>
        </div>

        <nav className="nav-menu">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}

          <button className="btn btn-ghost" type="button" onClick={clearCurrentAdmin}>
            Logout Admin
          </button>
        </nav>
      </aside>

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1>Pharmacy Management System</h1>
            <p>Manage users, medicines, orders, and stock operations.</p>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function AdminLoginPage() {
  const { currentAdmin, setCurrentAdmin } = useCart();
  const { notifyError, notifySuccess } = useNotifications();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!identifier.trim()) {
      notifyError('Enter admin username or email.');
      return;
    }

    setLoading(true);
    try {
      const response = await getUsers({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'desc' });
      const admin = (response.content || []).find(
        (user) =>
          user.role === 'ADMIN' &&
          (user.username?.toLowerCase() === identifier.trim().toLowerCase() ||
            user.email?.toLowerCase() === identifier.trim().toLowerCase())
      );

      if (!admin) {
        notifyError('Admin account not found.');
        return;
      }

      setCurrentAdmin(admin);
      notifySuccess(`Welcome, ${admin.firstName || admin.username}.`);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (currentAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="page-section">
      <section className="card customer-auth-card">
        <div className="section-title-row">
          <h2>Admin Login</h2>
          <span className="helper-text">Only ADMIN users should continue to the internal dashboard.</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group full-width">
            <label>Admin Username or Email</label>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin.pharmacy or admin@pharmacy.local"
            />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary customer-btn" type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Continue to Admin'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ProtectedAdminRoute() {
  const { currentAdmin } = useCart();

  if (!currentAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <AdminLayout />;
}

function App() {
  return (
    <>
      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<CustomerHomePage />} />
          <Route path="/medicines" element={<CustomerMedicinesPage />} />
          <Route path="/medicines/:id" element={<CustomerMedicineDetailPage />} />
          <Route path="/cart" element={<CustomerCartPage />} />
          <Route path="/checkout" element={<CustomerCheckoutPage />} />
          <Route path="/my-orders" element={<CustomerOrdersPage />} />
          <Route path="/login" element={<CustomerLoginPage />} />
          <Route path="/register" element={<CustomerRegisterPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedAdminRoute />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Routes>

      <NotificationContainer />
    </>
  );
}

export default App;

// Made with Bob
