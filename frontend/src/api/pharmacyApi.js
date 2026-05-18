import { extractApiError, extractEnvelope, medicineClient, orderClient, userClient } from './clients';
import { mockMedicines, mockUsers } from '../data/mockData';

function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

function normalizeUserRole(role) {
  if (role === 'PHARMACIST') return 'ADMIN';
  if (role === 'CUSTOMER') return 'USER';
  return role;
}

function decorateUser(user) {
  return {
    ...user,
    role: user.role === 'USER' ? 'CUSTOMER' : user.role
  };
}

function paginate(items, page = 0, size = 10) {
  const start = page * size;
  const content = items.slice(start, start + size);
  return {
    content,
    medicines: content,
    orders: content,
    currentPage: page,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
    totalItems: items.length,
    totalElements: items.length,
    pageable: {
      pageNumber: page,
      pageSize: size
    },
    last: start + size >= items.length,
    first: page === 0
  };
}

function normalizeUserPage(pageData) {
  return {
    ...pageData,
    content: (pageData?.content || []).map(decorateUser)
  };
}

function sortByDate(items, field = 'createdAt') {
  return [...items].sort((a, b) => new Date(b[field] || b.orderDate || 0) - new Date(a[field] || a.orderDate || 0));
}

async function withFallback(requestFn, fallbackFn) {
  try {
    return await requestFn();
  } catch (error) {
    return fallbackFn(extractApiError(error));
  }
}

export async function getDashboardData() {
  const [usersResult, medicinesResult, ordersResult, lowStockResult] = await Promise.all([
    withFallback(
      async () => normalizeUserPage(extractEnvelope(await userClient.get('', { params: { page: 0, size: 50, sortBy: 'createdAt', sortDir: 'desc' } }))),
      () => paginate(sortByDate(clone(mockUsers)), 0, 50)
    ),
    withFallback(
      async () => extractEnvelope(await medicineClient.get('', { params: { page: 0, size: 50 } })),
      () => ({ medicines: sortByDate(clone(mockMedicines)), totalItems: mockMedicines.length, currentPage: 0, totalPages: 1 })
    ),
    extractEnvelope(await orderClient.get('', { params: { page: 0, size: 50 } })),
    withFallback(
      async () => extractEnvelope(await medicineClient.get('/low-stock', { params: { threshold: 10 } })),
      () => clone(mockMedicines.filter((item) => item.stockQuantity <= 10))
    )
  ]);

  const users = usersResult.content || [];
  const medicines = medicinesResult.medicines || [];
  const orders = ordersResult.orders || [];
  const lowStock = lowStockResult || [];

  return {
    stats: {
      totalUsers: usersResult.totalElements ?? users.length,
      totalMedicines: medicinesResult.totalItems ?? medicines.length,
      totalOrders: ordersResult.totalItems ?? orders.length,
      lowStockCount: lowStock.length
    },
    recentOrders: sortByDate(orders, 'orderDate').slice(0, 5),
    lowStockMedicines: lowStock.slice(0, 5)
  };
}

export async function getUsers(params) {
  return withFallback(
    async () => normalizeUserPage(extractEnvelope(await userClient.get('', { params }))),
    () => paginate(sortByDate(clone(mockUsers)), params.page || 0, params.size || 10)
  );
}

export async function searchUsers(keyword, page = 0, size = 10) {
  return withFallback(
    async () => normalizeUserPage(extractEnvelope(await userClient.get('/search', { params: { keyword, page, size } }))),
    () => {
      const filtered = mockUsers.filter((user) =>
        `${user.username} ${user.email} ${user.firstName} ${user.lastName}`.toLowerCase().includes(keyword.toLowerCase())
      );
      return paginate(sortByDate(clone(filtered)), page, size);
    }
  );
}

export async function getUsersByRole(role, page = 0, size = 10) {
  const backendRole = normalizeUserRole(role);
  return withFallback(
    async () => normalizeUserPage(extractEnvelope(await userClient.get(`/role/${backendRole}`, { params: { page, size } }))),
    () => paginate(sortByDate(clone(mockUsers.filter((user) => user.role === role))), page, size)
  );
}

export async function createUser(payload) {
  const requestPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    password: payload.password,
    role: normalizeUserRole(payload.role)
  };
  return decorateUser(extractEnvelope(await userClient.post('/register', requestPayload)));
}

export async function updateUser(id, payload) {
  const requestPayload = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    username: payload.username,
    email: payload.email,
    role: normalizeUserRole(payload.role),
    active: payload.active ?? true
  };
  return decorateUser(extractEnvelope(await userClient.put(`/${id}`, requestPayload)));
}

export async function deleteUser(id) {
  return extractEnvelope(await userClient.delete(`/${id}`));
}

export async function checkEmailExists(email) {
  return withFallback(
    async () => extractEnvelope(await userClient.get('/check/email', { params: { email } })),
    () => mockUsers.some((item) => item.email.toLowerCase() === email.toLowerCase())
  );
}

export async function checkUsernameExists(username) {
  return withFallback(
    async () => extractEnvelope(await userClient.get('/check/username', { params: { username } })),
    () => mockUsers.some((item) => item.username.toLowerCase() === username.toLowerCase())
  );
}

export async function getMedicines(params) {
  return withFallback(
    async () => extractEnvelope(await medicineClient.get('', { params })),
    () => {
      let items = clone(mockMedicines);
      if (params.category) {
        items = items.filter((item) => item.category === params.category);
      }
      return { medicines: sortByDate(items), currentPage: params.page || 0, totalPages: 1, totalItems: items.length };
    }
  );
}

export async function getMedicineById(id) {
  return withFallback(
    async () => extractEnvelope(await medicineClient.get(`/${id}`)),
    () => clone(mockMedicines.find((item) => String(item.id) === String(id)))
  );
}

export async function searchMedicines(keyword) {
  return withFallback(
    async () => extractEnvelope(await medicineClient.get('/search', { params: { keyword } })),
    () =>
      clone(mockMedicines.filter((item) =>
        `${item.name} ${item.description} ${item.category} ${item.manufacturer}`.toLowerCase().includes(keyword.toLowerCase())
      ))
  );
}

export async function getLowStockMedicines(threshold = 10) {
  return withFallback(
    async () => extractEnvelope(await medicineClient.get('/low-stock', { params: { threshold } })),
    () => clone(mockMedicines.filter((item) => item.stockQuantity <= threshold))
  );
}

export async function createMedicine(payload) {
  return extractEnvelope(await medicineClient.post('', payload));
}

export async function updateMedicine(id, payload) {
  return extractEnvelope(await medicineClient.put(`/${id}`, payload));
}

export async function deleteMedicine(id) {
  return extractEnvelope(await medicineClient.delete(`/${id}`));
}

export async function updateMedicineStock(id, payload) {
  return extractEnvelope(await medicineClient.patch(`/${id}/stock`, payload));
}

export async function getOrders(params) {
  return extractEnvelope(await orderClient.get('', { params }));
}

export async function getOrderById(id) {
  return extractEnvelope(await orderClient.get(`/${id}`));
}

export async function createOrder(payload) {
  const requestPayload = {
    userId: Number(payload.userId),
    items: (payload.items || []).map((item) => ({
      medicineId: Number(item.medicineId),
      quantity: Number(item.quantity)
    }))
  };
  return extractEnvelope(await orderClient.post('', requestPayload));
}

export async function updateOrderStatus(id, status) {
  return extractEnvelope(await orderClient.put(`/${id}/status`, { status }));
}

export async function deleteOrder(id) {
  return extractEnvelope(await orderClient.delete(`/${id}`));
}

export async function getPurchaseHistory(userId, startDate, endDate) {
  return extractEnvelope(await orderClient.get(`/user/${userId}/history`, { params: { startDate, endDate } }));
}

// Made with Bob
