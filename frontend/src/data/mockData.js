export const mockUsers = [
  {
    id: 1,
    username: 'admin.pharmacy',
    email: 'admin@pharmacy.local',
    password: 'SecurePass123!',
    firstName: 'Asha',
    lastName: 'Kulkarni',
    role: 'ADMIN',
    phoneNumber: '+91 9876543210',
    address: '12 MG Road, Pune',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-12T09:00:00Z'
  },
  {
    id: 2,
    username: 'pharmacist.rao',
    email: 'rao@pharmacy.local',
    password: 'SecurePass123!',
    firstName: 'Vikram',
    lastName: 'Rao',
    role: 'PHARMACIST',
    phoneNumber: '+91 9123456780',
    address: '45 FC Road, Pune',
    createdAt: '2026-05-11T11:15:00Z',
    updatedAt: '2026-05-13T10:30:00Z'
  },
  {
    id: 3,
    username: 'customer.neha',
    email: 'neha@example.com',
    password: 'SecurePass123!',
    firstName: 'Neha',
    lastName: 'Sharma',
    role: 'CUSTOMER',
    phoneNumber: '+91 9988776655',
    address: '221 Baner Road, Pune',
    createdAt: '2026-05-12T08:45:00Z',
    updatedAt: '2026-05-12T08:45:00Z'
  },
  {
    id: 4,
    username: 'customer.aman',
    email: 'aman@example.com',
    password: 'SecurePass123!',
    firstName: 'Aman',
    lastName: 'Patel',
    role: 'CUSTOMER',
    phoneNumber: '+91 9012345678',
    address: '88 JM Road, Pune',
    createdAt: '2026-05-13T10:20:00Z',
    updatedAt: '2026-05-14T10:20:00Z'
  }
];

export const mockMedicines = [
  {
    id: 1,
    name: 'Paracetamol 500mg',
    description: 'Pain reliever and fever reducer',
    category: 'Pain Relief',
    manufacturer: 'PharmaCorp',
    price: 5.99,
    stockQuantity: 120,
    expiryDate: '2027-12-31',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-10T09:00:00Z'
  },
  {
    id: 2,
    name: 'Aspirin 100mg',
    description: 'Blood thinner and pain relief tablet',
    category: 'Cardiac Care',
    manufacturer: 'MediHealth',
    price: 8.5,
    stockQuantity: 6,
    expiryDate: '2026-09-15',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-14T09:00:00Z'
  },
  {
    id: 3,
    name: 'Amoxicillin 250mg',
    description: 'Broad-spectrum antibiotic capsules',
    category: 'Antibiotics',
    manufacturer: 'HealWell Labs',
    price: 14.75,
    stockQuantity: 18,
    expiryDate: '2026-08-01',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-14T09:00:00Z'
  },
  {
    id: 4,
    name: 'Omeprazole 20mg',
    description: 'Acid reflux and ulcer support medicine',
    category: 'Gastro',
    manufacturer: 'DigestCare',
    price: 9.25,
    stockQuantity: 42,
    expiryDate: '2027-04-20',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-14T09:00:00Z'
  },
  {
    id: 5,
    name: 'Metformin 500mg',
    description: 'Type 2 diabetes management tablet',
    category: 'Diabetes',
    manufacturer: 'GlucoLife',
    price: 11.99,
    stockQuantity: 9,
    expiryDate: '2026-10-30',
    createdAt: '2026-05-10T09:00:00Z',
    updatedAt: '2026-05-14T09:00:00Z'
  }
];

export const mockOrders = [
  {
    id: 101,
    userId: 3,
    status: 'PENDING',
    totalAmount: 23.98,
    paymentMethod: 'UPI',
    shippingAddress: '221 Baner Road, Pune',
    orderDate: '2026-05-15T10:30:00Z',
    updatedAt: '2026-05-15T10:30:00Z',
    orderItems: [
      { id: 1, medicineId: 1, medicineName: 'Paracetamol 500mg', quantity: 2, price: 5.99, subtotal: 11.98 },
      { id: 2, medicineId: 4, medicineName: 'Omeprazole 20mg', quantity: 1, price: 12, subtotal: 12 }
    ]
  },
  {
    id: 102,
    userId: 4,
    status: 'CONFIRMED',
    totalAmount: 29.49,
    paymentMethod: 'CREDIT_CARD',
    shippingAddress: '88 JM Road, Pune',
    orderDate: '2026-05-14T08:15:00Z',
    updatedAt: '2026-05-14T09:00:00Z',
    orderItems: [
      { id: 3, medicineId: 3, medicineName: 'Amoxicillin 250mg', quantity: 1, price: 14.75, subtotal: 14.75 },
      { id: 4, medicineId: 5, medicineName: 'Metformin 500mg', quantity: 1, price: 14.74, subtotal: 14.74 }
    ]
  },
  {
    id: 103,
    userId: 3,
    status: 'DELIVERED',
    totalAmount: 17,
    paymentMethod: 'CASH',
    shippingAddress: '221 Baner Road, Pune',
    orderDate: '2026-05-10T13:45:00Z',
    updatedAt: '2026-05-12T12:00:00Z',
    orderItems: [
      { id: 5, medicineId: 2, medicineName: 'Aspirin 100mg', quantity: 2, price: 8.5, subtotal: 17 }
    ]
  },
  {
    id: 104,
    userId: 2,
    status: 'CANCELLED',
    totalAmount: 11.99,
    paymentMethod: 'DEBIT_CARD',
    shippingAddress: '45 FC Road, Pune',
    orderDate: '2026-05-09T09:20:00Z',
    updatedAt: '2026-05-09T10:00:00Z',
    orderItems: [
      { id: 6, medicineId: 5, medicineName: 'Metformin 500mg', quantity: 1, price: 11.99, subtotal: 11.99 }
    ]
  },
  {
    id: 105,
    userId: 1,
    status: 'PROCESSING',
    totalAmount: 26.49,
    paymentMethod: 'CREDIT_CARD',
    shippingAddress: '12 MG Road, Pune',
    orderDate: '2026-05-16T07:45:00Z',
    updatedAt: '2026-05-16T08:10:00Z',
    orderItems: [
      { id: 7, medicineId: 1, medicineName: 'Paracetamol 500mg', quantity: 1, price: 5.99, subtotal: 5.99 },
      { id: 8, medicineId: 3, medicineName: 'Amoxicillin 250mg', quantity: 1, price: 14.75, subtotal: 14.75 },
      { id: 9, medicineId: 2, medicineName: 'Aspirin 100mg', quantity: 1, price: 5.75, subtotal: 5.75 }
    ]
  }
];

export const userRoles = ['CUSTOMER', 'ADMIN', 'PHARMACIST'];
export const orderStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
export const paymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'UPI'];

// Made with Bob
