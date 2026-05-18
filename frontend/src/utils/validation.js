import { orderStatuses, paymentMethods, userRoles } from '../data/mockData';

export function validateUser(values, isEdit = false) {
  const errors = {};

  if (!values.username || values.username.trim().length < 3 || values.username.trim().length > 50) {
    errors.username = 'Username must be 3–50 characters.';
  }

  if (!values.email || !/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isEdit && (!values.password || values.password.length < 8)) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!userRoles.includes(values.role)) {
    errors.role = 'Select a valid role.';
  }

  return errors;
}

export function validateMedicine(values) {
  const errors = {};

  if (!values.name?.trim()) errors.name = 'Medicine name is required.';
  if (Number(values.price) <= 0) errors.price = 'Price must be a positive number.';
  if (Number(values.stockQuantity) < 0) errors.stockQuantity = 'Stock quantity cannot be negative.';
  if (!values.expiryDate) {
    errors.expiryDate = 'Expiry date is required.';
  } else if (new Date(values.expiryDate) <= new Date()) {
    errors.expiryDate = 'Expiry date must be in the future.';
  }

  return errors;
}

export function validateOrder(values) {
  const errors = {};

  if (!values.userId) errors.userId = 'Select a user.';
  if (!values.shippingAddress?.trim()) errors.shippingAddress = 'Shipping address is required.';
  if (!paymentMethods.includes(values.paymentMethod)) errors.paymentMethod = 'Select a valid payment method.';
  if (!values.items?.length) errors.items = 'Add at least one medicine to the order.';
  if (values.status && !orderStatuses.includes(values.status)) errors.status = 'Invalid order status.';

  return errors;
}

// Made with Bob
