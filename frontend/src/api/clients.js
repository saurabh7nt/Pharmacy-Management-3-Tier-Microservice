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

// Detect environment: if running on localhost:5173 (Vite dev server), use localhost backend URLs
// Otherwise, use relative URLs (production/Kubernetes) - Nginx will proxy to backend services
const isDevelopment = window.location.hostname === 'localhost' && window.location.port === '5173';

const USER_SERVICE_URL = isDevelopment ? 'http://localhost:8081' : '';
const MEDICINE_SERVICE_URL = isDevelopment ? 'http://localhost:8082' : '';
const ORDER_SERVICE_URL = isDevelopment ? 'http://localhost:8083' : '';

export const userClient = createClient(`${USER_SERVICE_URL}/api/users`);
export const medicineClient = createClient(`${MEDICINE_SERVICE_URL}/api/medicines`);
export const orderClient = createClient(`${ORDER_SERVICE_URL}/api/orders`);

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
