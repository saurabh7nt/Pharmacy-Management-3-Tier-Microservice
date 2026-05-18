import { useEffect, useMemo, useState } from 'react';
import {
  checkEmailExists,
  checkUsernameExists,
  createUser,
  deleteUser,
  getUsers,
  getUsersByRole,
  searchUsers,
  updateUser
} from '../api/pharmacyApi';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { userRoles } from '../data/mockData';
import { formatDate } from '../utils/formatters';
import { validateUser } from '../utils/validation';
import { useNotifications } from '../context/NotificationContext';

const initialForm = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'CUSTOMER',
  active: true
};

function UsersPage() {
  const [usersData, setUsersData] = useState({ content: [], totalPages: 1, pageable: { pageNumber: 0 } });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [availability, setAvailability] = useState({});
  const { notifyError, notifySuccess } = useNotifications();

  const modalTitle = useMemo(() => (editingUser ? 'Edit User' : 'Register User'), [editingUser]);

  async function loadUsers(nextPage = page) {
    setLoading(true);
    try {
      let response;
      if (keyword.trim()) {
        response = await searchUsers(keyword.trim(), nextPage, 10);
      } else if (roleFilter) {
        response = await getUsersByRole(roleFilter, nextPage, 10);
      } else {
        response = await getUsers({ page: nextPage, size: 10, sortBy: 'createdAt', sortDir: 'desc' });
      }
      setUsersData(response);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers(page);
  }, [page, keyword, roleFilter]);

  function openCreateModal() {
    setEditingUser(null);
    setForm(initialForm);
    setErrors({});
    setAvailability({});
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      username: user.username || '',
      email: user.email || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'CUSTOMER',
      active: user.active ?? true
    });
    setErrors({});
    setAvailability({});
    setIsModalOpen(true);
  }

  async function handleAvailabilityCheck(field, value) {
    if (!value || editingUser) return;
    try {
      const exists = field === 'email' ? await checkEmailExists(value) : await checkUsernameExists(value);
      setAvailability((current) => ({ ...current, [field]: exists ? `${field} already exists` : `${field} is available` }));
    } catch (error) {
      setAvailability((current) => ({ ...current, [field]: error.message }));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationErrors = validateUser(form, Boolean(editingUser));
    if (!editingUser) {
      if (availability.email?.includes('already')) validationErrors.email = 'Email already exists.';
      if (availability.username?.includes('already')) validationErrors.username = 'Username already exists.';
    }
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          username: form.username,
          email: form.email,
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          active: form.active
        });
        notifySuccess('User updated successfully.');
      } else {
        await createUser(form);
        notifySuccess('User registered successfully.');
      }
      setIsModalOpen(false);
      loadUsers(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function handleDelete(userId) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(userId);
      notifySuccess('User deleted successfully.');
      loadUsers(page);
    } catch (error) {
      notifyError(error.message);
    }
  }

  return (
    <div className="page-section">
      <section className="card">
        <div className="section-title-row">
          <h2>User Management</h2>
          <button className="btn btn-primary" type="button" onClick={openCreateModal}>
            Register User
          </button>
        </div>

        <div className="toolbar">
          <div className="field-group">
            <label htmlFor="user-search">Search</label>
            <input id="user-search" value={keyword} onChange={(e) => { setPage(0); setKeyword(e.target.value); }} placeholder="Search users" />
          </div>

          <div className="field-group">
            <label htmlFor="role-filter">Role</label>
            <select id="role-filter" value={roleFilter} onChange={(e) => { setPage(0); setRoleFilter(e.target.value); }}>
              <option value="">All roles</option>
              {userRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading users..." />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.content?.map((user) => (
                    <tr key={user.id} className={user.role === 'ADMIN' ? 'admin-row' : ''}>
                      <td>
                        <strong>{user.firstName} {user.lastName}</strong>
                        <div className="muted">@{user.username}</div>
                      </td>
                      <td>
                        <div>{user.email}</div>
                        <div className="muted">{user.active === false ? 'Inactive user' : 'Active user'}</div>
                      </td>
                      <td><StatusBadge value={user.role} /></td>
                      <td>{formatDate(user.createdAt)}</td>
                      <td>
                        <div className="actions-row">
                          <button className="btn btn-secondary" type="button" onClick={() => openEditModal(user)}>Edit</button>
                          <button className="btn btn-danger" type="button" onClick={() => handleDelete(user.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination currentPage={usersData.pageable?.pageNumber || 0} totalPages={usersData.totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </section>

      {isModalOpen ? (
        <Modal title={modalTitle} onClose={() => setIsModalOpen(false)}>
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Username</label>
              <input
                value={form.username}
                disabled={Boolean(editingUser)}
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
                disabled={Boolean(editingUser)}
                onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
                onBlur={(e) => handleAvailabilityCheck('email', e.target.value)}
              />
              {errors.email ? <span className="error-text">{errors.email}</span> : null}
              {!errors.email && availability.email ? <span className="helper-text">{availability.email}</span> : null}
            </div>

            {!editingUser ? (
              <div className="field-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
                {errors.password ? <span className="error-text">{errors.password}</span> : null}
              </div>
            ) : null}

            <div className="field-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}>
                {userRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {errors.role ? <span className="error-text">{errors.role}</span> : null}
            </div>

            <div className="field-group">
              <label>First Name</label>
              <input value={form.firstName} onChange={(e) => setForm((current) => ({ ...current, firstName: e.target.value }))} />
            </div>

            <div className="field-group">
              <label>Last Name</label>
              <input value={form.lastName} onChange={(e) => setForm((current) => ({ ...current, lastName: e.target.value }))} />
            </div>

            {editingUser ? (
              <div className="field-group">
                <label>Status</label>
                <select value={String(form.active)} onChange={(e) => setForm((current) => ({ ...current, active: e.target.value === 'true' }))}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            ) : null}

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">{editingUser ? 'Update User' : 'Register User'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

export default UsersPage;

// Made with Bob
