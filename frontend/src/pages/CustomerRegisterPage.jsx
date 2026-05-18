import { useState } from 'react';
import { checkEmailExists, checkUsernameExists, createUser } from '../api/pharmacyApi';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { validateUser } from '../utils/validation';

const initialForm = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'CUSTOMER',
  phoneNumber: '',
  address: ''
};

function CustomerRegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState({});
  const { setCurrentCustomer } = useCart();
  const { notifySuccess, notifyError } = useNotifications();

  async function handleAvailabilityCheck(field, value) {
    if (!value) return;
    try {
      const exists = field === 'email' ? await checkEmailExists(value) : await checkUsernameExists(value);
      setAvailability((current) => ({ ...current, [field]: exists ? `${field} already exists` : `${field} is available` }));
    } catch (error) {
      setAvailability((current) => ({ ...current, [field]: error.message }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = { ...form, role: 'CUSTOMER' };
    const validationErrors = validateUser(payload, false);
    if (availability.email?.includes('already')) validationErrors.email = 'Email already exists.';
    if (availability.username?.includes('already')) validationErrors.username = 'Username already exists.';
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    try {
      const registeredUser = await createUser(payload);
      setCurrentCustomer({
        ...registeredUser,
        phoneNumber: form.phoneNumber,
        address: form.address
      });
      notifySuccess('Customer registered successfully. You can now place orders.');
      setForm(initialForm);
      setAvailability({});
    } catch (error) {
      notifyError(error.message);
    }
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="section-title-row">
          <h2>Customer Registration</h2>
          <span className="helper-text">Create your customer profile to place and track orders.</span>
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
              onBlur={(e) => handleAvailabilityCheck('username', e.target.value)}
            />
            {errors.username ? <span className="error-text">{errors.username}</span> : null}
            {!errors.username && availability.username ? <span className="helper-text">{availability.username}</span> : null}
          </div>

          <div className="field-group">
            <label>Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              onBlur={(e) => handleAvailabilityCheck('email', e.target.value)}
            />
            {errors.email ? <span className="error-text">{errors.email}</span> : null}
            {!errors.email && availability.email ? <span className="helper-text">{availability.email}</span> : null}
          </div>

          <div className="field-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
            {errors.password ? <span className="error-text">{errors.password}</span> : null}
          </div>

          <div className="field-group">
            <label>First Name</label>
            <input value={form.firstName} onChange={(e) => setForm((current) => ({ ...current, firstName: e.target.value }))} />
          </div>

          <div className="field-group">
            <label>Last Name</label>
            <input value={form.lastName} onChange={(e) => setForm((current) => ({ ...current, lastName: e.target.value }))} />
          </div>

          <div className="field-group">
            <label>Phone Number</label>
            <input value={form.phoneNumber} onChange={(e) => setForm((current) => ({ ...current, phoneNumber: e.target.value }))} />
          </div>

          <div className="field-group full-width">
            <label>Address</label>
            <textarea rows="3" value={form.address} onChange={(e) => setForm((current) => ({ ...current, address: e.target.value }))} />
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">Register Customer</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default CustomerRegisterPage;

// Made with Bob
