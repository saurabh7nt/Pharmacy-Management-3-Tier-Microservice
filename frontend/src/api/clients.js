import axios from 'axios';

const defaultHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json'
};

function createClient(baseURL) {
  return axios.create({
    baseURL,
    headers: defaultHeaders,
    timeout: 5000
  });
}

// Development = local Vite frontend
const isDevelopment =
  window.location.hostname === 'localhost' &&
  window.location.port === '5173';

// Development URLs
const USER_SERVICE_URL = 'http://localhost:8081/api/users';
const MEDICINE_SERVICE_URL = 'http://localhost:8082/api/medicines';
const ORDER_SERVICE_URL = 'http://localhost:8083/api/orders';

// Production/Kubernetes ingress URLs
const USER_INGRESS_URL = '/api/users';
const MEDICINE_INGRESS_URL = '/api/medicines';
const ORDER_INGRESS_URL = '/api/orders';

export const userClient = createClient(
  isDevelopment ? USER_SERVICE_URL : USER_INGRESS_URL
);

export const medicineClient = createClient(
  isDevelopment ? MEDICINE_SERVICE_URL : MEDICINE_INGRESS_URL
);

export const orderClient = createClient(
  isDevelopment ? ORDER_SERVICE_URL : ORDER_INGRESS_URL
);

export function extractEnvelope(response) {
  const payload = response?.data;

  if (!payload?.success) {
    throw new Error(payload?.message || 'Request failed');
  }

  return payload.data;
}

export function extractApiError(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Unable to reach the service. Fallback data loaded.'
  );
}