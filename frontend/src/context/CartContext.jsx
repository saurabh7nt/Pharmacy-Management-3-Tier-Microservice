import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'pharmacy-cart';
const CUSTOMER_STORAGE_KEY = 'pharmacy-current-customer';
const ADMIN_STORAGE_KEY = 'pharmacy-admin-session';

const CartContext = createContext(null);

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readJson(CART_STORAGE_KEY, []));
  const [currentCustomer, setCurrentCustomerState] = useState(() => readJson(CUSTOMER_STORAGE_KEY, null));
  const [currentAdmin, setCurrentAdminState] = useState(() => readJson(ADMIN_STORAGE_KEY, null));

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (currentCustomer) {
      window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(currentCustomer));
    } else {
      window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
    }
  }, [currentCustomer]);

  useEffect(() => {
    if (currentAdmin) {
      window.localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(currentAdmin));
    } else {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
    }
  }, [currentAdmin]);

  function addItem(medicine, quantity = 1) {
    setItems((current) => {
      const existing = current.find((item) => String(item.medicineId) === String(medicine.id));
      if (existing) {
        return current.map((item) =>
          String(item.medicineId) === String(medicine.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...current,
        {
          medicineId: medicine.id,
          name: medicine.name,
          price: Number(medicine.price),
          quantity,
          category: medicine.category,
          manufacturer: medicine.manufacturer
        }
      ];
    });
  }

  function updateQuantity(medicineId, quantity) {
    if (quantity <= 0) {
      removeItem(medicineId);
      return;
    }

    setItems((current) =>
      current.map((item) =>
        String(item.medicineId) === String(medicineId)
          ? { ...item, quantity: Number(quantity) }
          : item
      )
    );
  }

  function removeItem(medicineId) {
    setItems((current) => current.filter((item) => String(item.medicineId) !== String(medicineId)));
  }

  function clearCart() {
    setItems([]);
  }

  function setCurrentCustomer(customer) {
    setCurrentCustomerState(customer);
  }

  function loginCustomer(customer) {
    setCurrentCustomerState(customer);
  }

  function clearCurrentCustomer() {
    setCurrentCustomerState(null);
  }

  function setCurrentAdmin(admin) {
    setCurrentAdminState(admin);
  }

  function clearCurrentAdmin() {
    setCurrentAdminState(null);
  }

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const cartTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

    return {
      items,
      itemCount,
      cartTotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      currentCustomer,
      setCurrentCustomer,
      loginCustomer,
      clearCurrentCustomer,
      currentAdmin,
      setCurrentAdmin,
      clearCurrentAdmin
    };
  }, [items, currentCustomer, currentAdmin]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }

  return context;
}


